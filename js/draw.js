var canvas = document.getElementById("display");
var c_2d = canvas.getContext("2d");

const TILE_SIZE = 16;
const MISSING_COLOR = "#000000";

var disp_size, pix_size;

var tiles = new Map();
var tris = new Map([
    ["0,0,0", [1]],
    ["0,0,1", [1]],
    ["0,-1,1", [0]],
    ["1,-1,0", [0]],
    ["1,-1,1", [2]],
    ["1,0,0", [2]]
]);

var cam = [0, 0];
var targ_cam = [0, 0];

const textures = {
    "0": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"], // ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"],
    "1": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"], // ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"]
    "2": ["#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#737373"]
};
const y_bord_textures = {
    "0": [["#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373"], ["#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373"]],
    "1": [["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"], ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]],
    "2": [["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"], ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]]
};
const y_bord_dbl_textures = {
    "1,2": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"]
};
const xy_bord_textures = {};
const yx_bord_textures = {};

function hsl_to_rgb(h, s, l) {
    h = (h % 360 + 360) % 360;

    h /= 360;
    s /= 100;
    l /= 100;

    var r = l;
    var g = l;
    var b = l;

    if(s != 0) {
        var color_to_rgb = (p, q, t) => {
            if (t < 0)
                t++;

            if (t > 1)
                t--;

            if (t < 1 / 6)
                return p + (q - p) * 6 * t;

            if (t < 1 / 2)
                return q;

            if (t < 2 / 3)
                return p + (q - p) * (2/3 - t) * 6;

            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;

        var p = 2 * l - q;

        r = color_to_rgb(p, q, h + 1 / 3);
        g = color_to_rgb(p, q, h);
        b = color_to_rgb(p, q, h - 1 / 3);
    }

    function xx(c) {
        return Math.round(c).toString(16).padStart(2, "0");
    }
    
    return "#" + xx(r * 255) + xx(g * 255) + xx(b * 255);
}

function load_pix_color(x, y) {
    function mod_8(n) {
        return (n % 8 + 8) % 8;
    }
    
    var is_xy_bord = mod_8(Math.floor(x / 2) - y) == 0;
    var is_yx_bord = mod_8(Math.floor(x / 2) + y) == 0;
    var is_y_bord_0 = mod_8(x) == 0;
    var is_y_bord_1 = mod_8(x) == 1;
    var is_y_bord = is_y_bord_0 || is_y_bord_1;
    var is_corner = is_xy_bord && is_yx_bord;
    var is_face = !(is_xy_bord || is_yx_bord || is_y_bord);
    
    // return is_corner ? "#000000" : is_pq_bord ? "#008800" : is_qp_bord ? "#880000" : is_p_bord_0 ? "#008888" : is_p_bord_1 ? "#000088" : "#dddddd";
    
    var tri_x = Math.floor(x / 8);
    var tri_yx = Math.floor((y - Math.floor(x / 2)) / 8);
    var tri_r = y - tri_yx * 8 - tri_x * 4 - (tri_x % 2 + 2) % 2 * 4 > 8 - mod_8(x / 2) ? 1 : 0; // todo: could prolly simplify
    var tri = [tri_x, tri_yx, tri_r];
    
    var subtri_x = mod_8(x) - 2;
    var subtri_y = y - tri_yx * 8 - tri_x * 4 - 2;
    var subtri_norm_y = subtri_y - Math.floor(subtri_x / 2) - (subtri_y > 4 - Math.floor(subtri_x / 2) ? 1 : 0);
    var subtri = subtri_x + subtri_norm_y * 6;
    
    // return x == 0 && y == 0 ? "#ffffff" : is_face ? /*hsl_to_rgb(180, (tri_x * 10 % 100 + 100) % 100, ((tri_yx * 2 + tri_r) * 10 % 100 + 100) % 100)*/ hsl_to_rgb(subtri * 10, 80, 70) : "#000000";
    // return hsl_to_rgb(180, (tri_x * 10 % 100 + 100) % 100, ((tri_yx * 2 + tri_r + is_face) * 10 % 100 + 100) % 100);
    
    if (is_face) {
        return tris.has(tri_x + "," + tri_yx + "," + tri_r) ? textures[tris.get(tri_x + "," + tri_yx + "," + tri_r)[0]][subtri] : MISSING_COLOR;
    }
    
    if (is_corner) {
        return MISSING_COLOR;
    }
    
    // todo: base borders off of blocks rather than tris
    
    if (is_y_bord_0) {
        var f_0 = tris.has((tri_x - 1) + "," + tri_yx + ",1") ? tris.get((tri_x - 1) + "," + tri_yx + ",1")[0] : null;
        var f_1 = tris.has(tri_x + "," + tri_yx + ",0") ? tris.get(tri_x + "," + tri_yx + ",0")[0] : null;
        
        if (f_0 == null) {
            return MISSING_COLOR;
        }
        
        if (f_0 == null || f_1 == null || !((f_0 + "," + f_1) in y_bord_dbl_textures)) {
            return f_0 in y_bord_textures ? y_bord_textures[f_0][0][y - tri_yx * 8 - tri_x * 4 - 1] : MISSING_COLOR;
        }
        
        return y_bord_dbl_textures[f_0 + "," + f_1][(y - tri_yx * 8 - tri_x * 4 - 1) * 2];
    }
    
    if (is_y_bord_1) {
        var f_0 = tris.has((tri_x - 1) + "," + tri_yx + ",1") ? tris.get((tri_x - 1) + "," + tri_yx + ",1")[0] : null;
        var f_1 = tris.has(tri_x + "," + tri_yx + ",0") ? tris.get(tri_x + "," + tri_yx + ",0")[0] : null;
        
        if (f_1 == null) {
            return MISSING_COLOR;
        }
        
        if (f_0 == null || !((f_0 + "," + f_1) in y_bord_dbl_textures)) {
            return f_1 in y_bord_textures ? y_bord_textures[f_1][1][y - tri_yx * 8 - tri_x * 4 - 1] : MISSING_COLOR;
        }
        
        return y_bord_dbl_textures[f_0 + "," + f_1][(y - tri_yx * 8 - tri_x * 4 - 1) * 2 + 1];
    }
    
    if (is_xy_bord) {
        var f_0 = tris.has(tri_x + "," + tri_yx + ",0") ? tris.get(tri_x + "," + tri_yx + ",0")[0] : null;
        var f_1 = tris.has(tri_x + "," + tri_yx + ",1") ? tris.get(tri_x + "," + tri_yx + ",1")[0] : null;
        
        if (f_0 == null || f_1 == null || !((f_0 + "," + f_1) in xy_bord_textures)) {
            return MISSING_COLOR;
        }
        
        return xy_bord_textures[f_0 + "," + f_1][mod_8(x) - 2];
    }
    
    if (is_yx_bord) {
        var f_0 = tris.has(tri_x + "," + (tri_yx - 1) + ",0") ? tris.get(tri_x + "," + (tri_yx - 1) + ",0")[0] : null;
        var f_1 = tris.has(tri_x + "," + tri_yx + ",1") ? tris.get(tri_x + "," + tri_yx + ",1")[0] : null;
        
        if (f_0 == null || f_1 == null || !((f_0 + "," + f_1) in yx_bord_textures)) {
            return MISSING_COLOR;
        }
        
        return yx_bord_textures[f_0 + "," + f_1][mod_8(x) - 2];
    }
}

function load_tile(tx, ty) {
    if (tiles.has(tx + "," + ty)) {
        return tiles.get(tx + "," + ty);
    } else {
        var tile = document.createElement("canvas");
        var t_2d = tile.getContext("2d");

        tile.width = TILE_SIZE;
        tile.height = TILE_SIZE;

        var x, y;

        for (x = 0; x < TILE_SIZE; x++) for (y = 0; y < TILE_SIZE; y++) {
            t_2d.fillStyle = load_pix_color(tx * TILE_SIZE + x, ty * TILE_SIZE + y);
            t_2d.fillRect(x, y, 1, 1);
        }

        tiles.set(tx + "," + ty, tile);

        return tile;
    }
}

function draw(tick_time_ms) {
    c_2d.clearRect(0, 0, disp_size[0], disp_size[1]);
    
    /*function draw_pix(x, y, c_2d, px, py, pw = 1) {
        c_2d.fillStyle = "#" + hsl_to_rgb(0, 0, (x ** 2 + y ** 2) % 100).map(x => Math.floor(x).toString(16).padStart(2, "0")).join("");
        c_2d.fillRect(px, py, pw, pw);
    }*/
    
    function pix_to_pxs(x, y) {
        return [
            Math.floor(disp_size[0] / 2) + (x - cam[0]) * pix_size,
            Math.floor(disp_size[1] / 2) + (y - cam[1]) * pix_size
        ];
    }
    
    var min_tile_x = Math.floor((cam[0] - Math.floor(disp_size[0] / 2) / pix_size) / TILE_SIZE);
    var incl_tile_x = Math.floor((cam[0] + Math.ceil(disp_size[0] / 2) / pix_size) / TILE_SIZE);
    var min_tile_y = Math.floor((cam[1] - Math.floor(disp_size[1] / 2) / pix_size) / TILE_SIZE);
    var incl_tile_y = Math.floor((cam[1] + Math.ceil(disp_size[1] / 2) / pix_size) / TILE_SIZE);
    
    var x, y;
    
    for (x = min_tile_x; x <= incl_tile_x; x++) for (y = min_tile_y; y <= incl_tile_y; y++) c_2d.drawImage(load_tile(x, y), ...pix_to_pxs(x * TILE_SIZE, y * TILE_SIZE), pix_size * TILE_SIZE, pix_size * TILE_SIZE);
}

function resize() {
    disp_size = [window.innerWidth, window.innerHeight];
    pix_size = Math.round(Math.sqrt((disp_size[0] * disp_size[1]) / (144 * 16 * 8)));
    
    canvas.width = disp_size[0];
    canvas.height = disp_size[1];
    c_2d.imageSmoothingEnabled = false;

    draw();
}

window.addEventListener("resize", resize, false);

resize();

function render_chunk_terrain(chx, chy) {
    var terrain_height_map = [...Array(CHUNK_SIZE)].map((_, x) => [...Array(CHUNK_SIZE)].map((_, y) => terrain_height(x, y)));
    
    
}