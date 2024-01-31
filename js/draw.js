var canvas = document.getElementById("display");
var c_2d = canvas.getContext("2d");

const TILE_SIZE = 16;
const MISSING_COLOR = "#000000";

var disp_size, pix_size;

var tiles = new Map();
var tris = new Map();

var cam = [0, 0];
var targ_cam = [0, 0];

const textures = {
    "0": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"], // ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"],
    "1": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"], // ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"]
    "2": ["#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#737373", "#acacac", "#acacac", "#737373", "#737373", "#acacac", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#737373", "#737373", "#737373", "#acacac", "#acacac", "#acacac", "#737373"],
    "4": ["#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17"],
    "5": ["#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d"],
    "6": ["#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29"]
};
const y_bord_textures = {
    "0": [["#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373"], ["#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373"]],
    "1": [["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"], ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]],
    "2": [["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"], ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"]]
};
const y_bord_dbl_textures = {
    "1,2": ["#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373", "#737373"],
    "4,4": ["#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17"],
    "5,5": ["#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d"],
    "6,6": ["#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29"],
    "5,6": ["#71503d", "#563a29", "#71503d", "#563a29", "#71503d", "#563a29", "#71503d", "#563a29", "#71503d", "#563a29", "#71503d", "#563a29", "#71503d", "#563a29"]
};
const xy_bord_textures = {
    "2,2": ["#acacac", "#acacac", "#acacac", "#acacac", "#acacac", "#737373"],
    "4,4": ["#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17"],
    "5,5": ["#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d"],
    "6,6": ["#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29"],
    "5,4": ["#469b10", "#469b10", "#469b10", "#469b10", "#469b10", "#469b10"]
};
const yx_bord_textures = {
    "1,1": ["#737373", "#acacac", "#acacac", "#acacac", "#acacac", "#acacac"],
    "4,4": ["#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17", "#64dd17"],
    "5,5": ["#71503d", "#71503d", "#71503d", "#71503d", "#71503d", "#71503d"],
    "6,6": ["#563a29", "#563a29", "#563a29", "#563a29", "#563a29", "#563a29"],
    "4,6": ["#469b10", "#469b10", "#469b10", "#469b10", "#469b10", "#469b10"]
};

const blocks = {
    "0": {},
    "1": {
        tris: {
            top: [4, 4],
            left: [5, 5],
            right: [6, 6]
        },
        is_opaque: true
    },
    "2": {
        tris: {
            top: [5, 5],
            left: [5, 5],
            right: [6, 6]
        },
        is_opaque: true
    },
    "3": {
        tris: {
            top: [0, 0],
            left: [1, 1],
            right: [2, 2]
        },
        is_opaque: true
    }
};

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

function load_tri(x, xy, r) {
    if (tris.has(x + "," + xy + "," + r)) return tris.get(x + "," + xy + "," + r);
    
    var tri = [];
    
    var y = MAX_TERRAIN_Y;
    
    for (var b, y = MAX_TERRAIN_Y; y >= MIN_TERRAIN_Y; y--) {
        b = load_block(-(x + xy + r + y), y, -(xy + y));
        
        if (b != 0) {
            tri.push([blocks[b].tris.top[r], y * 3]);
            
            if (blocks[b].is_opaque) break;
        }
        
        b = load_block(-(x + xy + y), y, -(xy + y) + (1 - r));
        
        if (b != 0) {
            tri.push([blocks[b].tris[["left", "right"][r]][r], y * 3 + 1]);
            
            if (blocks[b].is_opaque) break;
        }
        
        b = load_block(-(x + xy + y) + (1 - r), y, -(xy + y) + 1);
        
        if (b != 0) {
            tri.push([blocks[b].tris[["right", "left"][r]][r], y * 3 + 2]);
            
            if (blocks[b].is_opaque) break;
        }
    }
    
    tris.set(x + "," + xy + "," + r, tri);
    
    return tri;
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
    var tri_xy = Math.floor((y - Math.floor(x / 2)) / 8);
    var tri_r = y - tri_xy * 8 - tri_x * 4 - (tri_x % 2 + 2) % 2 * 4 > 8 - mod_8(x / 2) ? 1 : 0; // todo: could prolly simplify
    var tri = [tri_x, tri_xy, tri_r];
    
    var subtri_x = mod_8(x) - 2;
    var subtri_y = y - tri_xy * 8 - tri_x * 4 - 2;
    var subtri_norm_y = subtri_y - Math.floor(subtri_x / 2) - (subtri_y > 4 - Math.floor(subtri_x / 2) ? 1 : 0);
    var subtri = subtri_x + subtri_norm_y * 6;
    
    // return x == 0 && y == 0 ? "#ffffff" : is_face ? /*hsl_to_rgb(180, (tri_x * 10 % 100 + 100) % 100, ((tri_xy * 2 + tri_r) * 10 % 100 + 100) % 100)*/ hsl_to_rgb(subtri * 10, 80, 70) : "#000000";
    // return hsl_to_rgb(is_face ? 190 : 190, (tri_x * 10 % 100 + 100) % 100, ((tri_xy * 2 + tri_r) * 10 % 100 + 100) % 100);
    
    if (is_face) {
        var tri = load_tri(tri_x, tri_xy, tri_r);
        
        if (!tri.length) return MISSING_COLOR;
        
        return textures[tri[0][0]][subtri];
    }
    
    if (is_corner) {
        return MISSING_COLOR;
    }
    
    // todo: base borders off of blocks rather than tris
    
    if (is_y_bord_0) {
        var f_0 = load_tri(tri_x - 1, tri_xy, 1);
        var f_1 = load_tri(tri_x, tri_xy, 0);
        
        if (f_0.length == 0) {
            return MISSING_COLOR;
        }
        
        if (f_1.length == 0 || !((f_0[0][0] + "," + f_1[0][0]) in y_bord_dbl_textures)) {
            return f_0[0][0] in y_bord_textures ? y_bord_textures[f_0[0][0]][0][y - tri_xy * 8 - tri_x * 4 - 1] : MISSING_COLOR;
        }
        
        return y_bord_dbl_textures[f_0[0][0] + "," + f_1[0][0]][(y - tri_xy * 8 - tri_x * 4 - 1) * 2];
    }
    
    if (is_y_bord_1) {
        var f_0 = load_tri(tri_x - 1, tri_xy, 1);
        var f_1 = load_tri(tri_x, tri_xy, 0);
        
        if (f_1.length == 0) {
            return MISSING_COLOR;
        }
        
        if (f_0.length == 0 || !((f_0[0][0] + "," + f_1[0][0]) in y_bord_dbl_textures)) {
            return f_1[0][0] in y_bord_textures ? y_bord_textures[f_1[0][0]][1][y - tri_xy * 8 - tri_x * 4 - 1] : MISSING_COLOR;
        }
        
        return y_bord_dbl_textures[f_0[0][0] + "," + f_1[0][0]][(y - tri_xy * 8 - tri_x * 4 - 1) * 2 + 1];
    }
    
    if (is_yx_bord) {
        var f_0 = load_tri(tri_x, tri_xy, 0);
        var f_1 = load_tri(tri_x, tri_xy, 1);
        
        if (f_0.length == 0 || f_1.length == 0 || !((f_0[0][0] + "," + f_1[0][0]) in yx_bord_textures)) {
            return MISSING_COLOR;
        }
        
        return yx_bord_textures[f_0[0][0] + "," + f_1[0][0]][mod_8(x) - 2];
    }
    
    if (is_xy_bord) {
        var f_0 = load_tri(tri_x, tri_xy, 0);
        var f_1 = load_tri(tri_x, (tri_xy - 1), 1);
        
        if (f_0.length == 0 || f_1.length == 0 || !((f_0[0][0] + "," + f_1[0][0]) in xy_bord_textures)) {
            return MISSING_COLOR;
        }
        
        return xy_bord_textures[f_0[0][0] + "," + f_1[0][0]][mod_8(x) - 2];
    }
}

function load_tile(tx, ty) {
    if (tiles.has(tx + "," + ty)) return tiles.get(tx + "," + ty);

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
    
    if (mouse_offset) {
        c_2d.textAlign = "left";
        c_2d.textBaseline = "bottom";
        
        c_2d.fillText(mouse_offset[0] + ", " + mouse_offset[1], mouse_offset - 2, mouse_offset + 2);
    }
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

function render_chunk_terrain(chx, chy) {
    var terrain_height_map = [...Array(CHUNK_SIZE)].map((_, x) => [...Array(CHUNK_SIZE)].map((_, y) => terrain_height(x, y)));
    
    
}