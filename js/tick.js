function tick(tick_time_ms) {
    var dir = Math.atan2(targ_cam[1] - cam[1], targ_cam[0] - cam[0]);
    
    cam[0] += Math.min(tick_time_ms / 1000 * 16, Math.abs(cam[0] - targ_cam[0])) * Math.cos(dir);
    cam[1] += Math.min(tick_time_ms / 1000 * 16, Math.abs(cam[1] - targ_cam[1])) * Math.sin(dir);
}