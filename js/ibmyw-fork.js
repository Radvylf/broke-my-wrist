var tick_ctx = {};
var draw_ctx = {
    canvas: document.getElementById("display")
};

draw_ctx.c2d = draw_ctx.canvas.getContext("2d");

function draw(tick_time_ms) {
    // approaches:
    // 1. redraw every frame (try this first)
    // 2. draw on background canvas and bitmap it in
    
    draw_ctx.c2d.clearRect(0, 0, draw_ctx.disp_size[0], draw_ctx.disp_size[1]);
    
    var cx = Math.trunc(window.innerWidth / 2);
    var cy = Math.trunc(window.innerHeight / 2);
    
    var x, y;
    
    var xw = Math.ceil((draw_ctx.disp_size[0] / draw_ctx.px_size) / 2);
    var yw = Math.ceil((draw_ctx.disp_size[1] / draw_ctx.px_size) / 2);
    
    function pix_to_pxs(x, y) {
        return [
            cx + x * draw_ctx.px_size,
            cy + y * draw_ctx.px_size
        ];
    }
    
    function draw_pix(x, y) {
        /*var col = Math.floor(Math.sin((Math.abs(x) + 1 / 2) * (Math.abs(y) + 1 / 2) * (Math.sign(x * y) || 1 / 2)) * 256).toString(16).padStart(2, "0").repeat(3);
        
        if (!col.includes("-")) draw_ctx.c2d.fillStyle = "#" + col;*/
        draw_ctx.c2d.fillStyle = "#" + ((x + y) % 2 ? "000000" : "ffffff");
        draw_ctx.c2d.fillRect(cx / draw_ctx.px_size + x, cy / draw_ctx.px_size + y, draw_ctx.px_size, draw_ctx.px_size);
    }
    
    for (x = -xw; x < xw; x++) for (y = -yw; y < yw; y++) draw_pix(x, y);
}

function tick(tick_time_ms) {
    
}

var frame_ctx = {
    p_time: null,
    p_now: null
};

function resize() {
    draw_ctx.disp_size = [window.innerWidth, window.innerHeight];
    draw_ctx.px_size = Math.round(Math.sqrt((draw_ctx.disp_size[0] * draw_ctx.disp_size[1]) / (144 * 16 * 8)));
    
    draw_ctx.canvas.width = Math.floor(draw_ctx.disp_size[0] / draw_ctx.px_size + 1);
    draw_ctx.canvas.height = Math.floor(draw_ctx.disp_size[1] / draw_ctx.px_size + 1);
    draw_ctx.canvas.style.width = Math.floor(draw_ctx.disp_size[0] / draw_ctx.px_size + 1) * draw_ctx.px_size + "px";
    draw_ctx.canvas.style.height = Math.floor(draw_ctx.disp_size[1] / draw_ctx.px_size + 1) * draw_ctx.px_size + "px";

    var now = Date.now();
    
    draw(now - (frame_ctx.p_now == null ? now : frame_ctx.p_now));
}

window.addEventListener("resize", resize, false);

resize();

function frame(time) {
    tick_ctx.time = time;
    
    var now = Date.now();
    
    try {
        var tick_time_ms = time - (frame_ctx.p_time == null ? time : frame_ctx.p_time);
        
        tick(tick_time_ms);
        draw(0);
    } finally {
        frame_ctx.p_time = time;
        frame_ctx.p_now = now;
        
        window.requestAnimationFrame(frame);
    }
}

window.requestAnimationFrame(frame);