module.exports = (duration) => {

    let hours = Math.floor(duration / 3600000)
    let minutes = Math.floor(((duration % 3600000) / 60000));
    let seconds = ((duration % 60000) / 1000).toFixed(0);
    return (hours ? hours + ":" : '') + minutes + ":" + (seconds < 10 ? "0" : '') + seconds;
}