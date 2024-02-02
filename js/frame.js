var p_time = null;

function frame(time) {
    var tick_time_ms = time - (p_time == null ? time : p_time);

    tick(tick_time_ms);
    draw();

    p_time = time;

    window.requestAnimationFrame(frame);
}