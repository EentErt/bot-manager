const { spawn } = require('child_process');

const running = new Map();

function isRunning(id) {
    return running.has(id);
}

function startBot(bot, onLog, onExit) {
    if (running.has(bot.id)) return;

    const child = spawn('node', ['index.js'], {
        cwd: bot.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    running.set(bot.id, child);

    child.stdout.on('data', d => onLog(bot.id, d.toString()));
    child.stderr.on('data', d => onLog(bot.id, d.toString()));

    child.on('exit', code => {
        running.delete(bot.id);
        onExit(bot.id, code);
    });
}

function stopBot(id) {
    const child = running.get(id);
    if (!child) return;
    child.kill();
}

module.exports = { startBot, stopBot, isRunning };