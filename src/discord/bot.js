require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { handleParlayCommand } = require('../commands/parlay');
const fs = require('fs');
const path = require('path');
const GradeCommand = require('../../cli/commands/grade');
const HistoryCommand = require('../../cli/commands/history');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  
  const commands = [
    new SlashCommandBuilder()
      .setName('parlay')
      .setDescription('Generate an NBA analytics parlay')
      .addIntegerOption(option =>
        option.setName('legs')
          .setDescription('Number of picks (2-10)')
          .setMinValue(2)
          .setMaxValue(10))
      .addStringOption(option =>
        option.setName('mode')
          .setDescription('Analysis mode')
          .addChoices(
            { name: 'Safe 🟢', value: 'safe' },
            { name: 'Normal 🟠', value: 'normal' },
            { name: 'Moonshot 🚀', value: 'moonshot' }
          )),
    
    new SlashCommandBuilder()
      .setName('pickoftheday')
      .setDescription('Get the strongest single pick'),
    
    new SlashCommandBuilder()
      .setName('why')
      .setDescription('Explain why a pick was chosen')
      .addIntegerOption(option =>
        option.setName('pick')
          .setDescription('Pick number (1, 2, 3...)')
          .setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('insights')
      .setDescription('Raw historical context for a pick')
      .addIntegerOption(option =>
        option.setName('pick')
          .setDescription('Pick number')
          .setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('grade')
      .setDescription('Mark a parlay as win or loss')
      .addStringOption(option =>
        option.setName('result')
          .setDescription('Did it hit?')
          .setRequired(true)
          .addChoices(
            { name: 'Win ✅', value: 'win' },
            { name: 'Loss ❌', value: 'loss' }
          )),
    
    new SlashCommandBuilder()
      .setName('history')
      .setDescription('View past results and performance')
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

// Store last parlay for /why and /grade commands
let lastParlay = null;

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'parlay') {
    await interaction.deferReply();

    const legs = interaction.options.getInteger('legs') || 3;
    const mode = interaction.options.getString('mode') || 'normal';
    const window = 10; // default sample window

    try {
      const results = await handleParlayCommand({
        legs,
        mode,
        window,
        respond: async (payload) => {
          // send embed payload via interaction
          await interaction.editReply(payload);
        }
      });

      if (!results || results.length === 0) {
        try { await interaction.editReply('❌ No picks found matching criteria'); } catch (e) {}
        return;
      }

      // store for /why and /insights
      lastParlay = { results, options: { legs, mode, window } };

      // persist slip
      try {
        const parlaysFile = path.join(__dirname, '../../data/parlays.json');
        let data = { parlays: [], slips: [] };
        if (fs.existsSync(parlaysFile)) {
          try { data = JSON.parse(fs.readFileSync(parlaysFile, 'utf8') || '{}'); } catch (e) { data = { parlays: [], slips: [] }; }
        }
        if (Array.isArray(data)) data = { parlays: data, slips: [] };

        const newSlip = {
          id: `parlay_${Date.now()}`,
          timestamp: new Date().toISOString(),
          meta: { legs, mode, generatedAt: new Date().toISOString() },
          picks: results.map(r => ({ desc: r.pick, hits: r.hits, games: r.games, odds: r.odds, label: r.label, confidence: r.confidence })),
          result: null
        };

        data.slips = data.slips || [];
        data.slips.push(newSlip);
        fs.writeFileSync(parlaysFile, JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn('Failed to persist parlay slip:', e.message);
      }
    } catch (err) {
      console.error('Parlay handler error:', err);
      await interaction.editReply('❌ Error generating parlay.');
    }
  }

  if (interaction.commandName === 'pickoftheday') {
    await interaction.deferReply();
    // Use lastParlay if present
    let pick = null;
    if (lastParlay && lastParlay.results && lastParlay.results.length > 0) pick = lastParlay.results[0];
    if (!pick) {
      await interaction.editReply('❌ No picks available today');
      return;
    }

    const emojiMap = { SAFE: '🟢', NORMAL: '🟠', MOONSHOT: '🚀' };
    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🏆 Pick of the Day')
      .setDescription(`**${pick.pick}**`)
      .addFields(
        { name: 'Confidence', value: `${pick.confidence}% ${emojiMap[pick.label] || ''}`, inline: true },
        { name: 'Hit Rate', value: `${pick.hits} / ${pick.games}`, inline: true },
        { name: 'Key Insights', value: `${pick.reason || 'Based on recent performance trends'}`, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: '⚠️ Educational analytics tool only' });

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'why') {
    if (!lastParlay) {
      await interaction.reply({ content: '❌ No recent parlay found. Run `/parlay` first!', ephemeral: true });
      return;
    }

    const pickNum = interaction.options.getInteger('pick');
    if (pickNum < 1 || pickNum > lastParlay.results.length) {
      await interaction.reply({ content: `❌ Pick number must be between 1 and ${lastParlay.results.length}`, ephemeral: true });
      return;
    }

    const pick = lastParlay.results[pickNum - 1];

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('🔍 Why This Pick?')
      .setDescription(`**${pick.pick}**`)
      .addFields(
        { name: 'Historical Performance', value: `• Hit in ${pick.hits} of last ${pick.games} games\n• ${pick.reason || 'No detailed explanation available'}`, inline: false },
        { name: 'Analysis Factors', value: '• Recent performance trends\n• Usage patterns\n• Matchup context\n• Statistical consistency', inline: false }
      )
      .setFooter({ text: 'Based on historical data analysis' });

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'insights') {
    if (!lastParlay) {
      await interaction.reply({ content: '❌ No recent parlay found. Run `/parlay` first!', ephemeral: true });
      return;
    }

    const pickNum = interaction.options.getInteger('pick');
    const pick = lastParlay.results[pickNum - 1];

    const embed = new EmbedBuilder()
      .setColor(0x95A5A6)
      .setTitle('📊 Historical Insights')
      .setDescription(`**${pick.pick}**`)
      .addFields(
        { name: 'Raw Data', value: `• Confidence Score: ${pick.confidence}%\n• Odds: ${pick.odds}\n• Label: ${pick.label}`, inline: false },
        { name: 'Context', value: '• No opinions\n• No predictions\n• Just historical context', inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'grade') {
    if (!lastParlay) {
      await interaction.reply({ content: '❌ No recent parlay found. Run `/parlay` first!', ephemeral: true });
      return;
    }

    const result = interaction.options.getString('result');
    
    // Save to parlays.json
    const parlaysFile = path.join(__dirname, '../../data/parlays.json');
    let data = { parlays: [], slips: [] };
    
    if (fs.existsSync(parlaysFile)) {
      try {
        const raw = fs.readFileSync(parlaysFile, 'utf8');
        data = JSON.parse(raw || '{}');
      } catch (e) {
        // fallback to defaults
        data = { parlays: [], slips: [] };
      }
    }
    
    // Find the last parlay and update it
    if (data.slips && data.slips.length > 0) {
      const lastSlip = data.slips[data.slips.length - 1];
      lastSlip.result = result;
      lastSlip.gradedAt = new Date().toISOString();
      fs.writeFileSync(parlaysFile, JSON.stringify(data, null, 2));
    }
    
    const emoji = result === 'win' ? '✅' : '❌';
    
    const embed = new EmbedBuilder()
      .setColor(result === 'win' ? 0x00FF00 : 0xFF0000)
      .setTitle(`${emoji} Parlay Graded`)
      .setDescription(`Marked as: **${result.toUpperCase()}**`)
      .addFields(
        { name: 'Status', value: `Result saved to tracking system\nUse `/history` to view all results.`, inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'history') {
    const parlaysFile = path.join(__dirname, '../../data/parlays.json');
    
    if (!fs.existsSync(parlaysFile)) {
      await interaction.reply({ content: '❌ No parlay history found yet. Run `/parlay` to get started!', ephemeral: true });
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(parlaysFile, 'utf8'));
    const graded = (data.slips || []).filter(s => s.result);
    const last5 = graded.slice(-5).reverse();
    
    if (last5.length === 0) {
      await interaction.reply({ content: '❌ No graded parlays yet. Use `/grade` after running `/parlay`!', ephemeral: true });
      return;
    }
    
    // Calculate stats
    const wins = graded.filter(s => s.result === 'win').length;
    const losses = graded.filter(s => s.result === 'loss').length;
    const winRate = graded.length > 0 ? ((wins / graded.length) * 100).toFixed(0) : 0;
    
    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('📜 Performance History')
      .setDescription(`**Overall:** ${wins}W - ${losses}L (${winRate}% win rate)\n\n**Last 5 Graded Parlays:**`)
      .setTimestamp();
    
    last5.forEach((slip, i) => {
      const emoji = slip.result === 'win' ? '✅' : '❌';
      const mode = slip.meta?.mode || 'unknown';
      const legs = slip.picks?.length || 0;
      const date = new Date(slip.timestamp || slip.createdAt).toLocaleDateString();
      
      embed.addFields({
        name: `${emoji} ${mode.toUpperCase()} | ${legs} Legs | ${date}`,
        value: `Result: ${slip.result.toUpperCase()}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
