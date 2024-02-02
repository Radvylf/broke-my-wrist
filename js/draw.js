var canvas = document.getElementById("display");
var c_2d = canvas.getContext("2d");

const TILE_SIZE = 16;
const MISSING_COLOR = "#000000";

var disp_size, pix_size;

var tiles = new Map();
var tris = new Map();

var cam = [0, 0];
var targ_cam = [0, 0];

var img_promises = [];

function load_img(b64) {
    var img = new Image();

    img.src = "data:image/png;base64," + b64;
    img_promises.push(new Promise((r) => (img.onload = r)));
    
    return img;
}

function load_imgs(data) {
    return data.map(load_img);
}

function load_colors(data) {
    var d = data.split(" ").map(b => window.atob(b).split("").map(x => x.charCodeAt(0)));
    
    return "rgba(" + d.slice(0, 3).join(", ") + ", " + d[3] / 255 + ")";
}

const overrides = {
    xy_top_bords: {
        "1,1": load_img("iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjTD6s9J+BgYFhru09RhANA3AOugIUVSDVMAUAs5QKSy5+I6sAAAAASUVORK5CYII=")
    },
    xy_side_bords: {},
    yx_top_bords: {
        "1,1": load_img("iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADyYeV/oOEGGHiMIG5tvfAYozoAjCFAF1yCkvImOcFAAAAAElFTkSuQmCC")
    },
    yx_side_bords: {}
};

const blocks = {
    0: { // air
        
    },
    1: { // grass
        faces: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjTD6s9H+u7T1GBiyAESQJE0dXhCKJrgirJEwR8Tqx2onLtQAudRpPmWngYwAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABkg8r/WdElwMJwsTgksiCcElsgsTpJMpObIoANtgP+UvDHhsAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjLAyw/d+/4TAjAxbACJKEiaMrQpFEV4RVEqaIeJ1Y7cTlWgD4lRoFbIuvpQAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABCgNs/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUAa4IN82JsOVMAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjDLPS/L/q2HVGBiyAESQJE0dXhCKJrgirJEwR8Tqx2onLtQDGbBnAGFGi6QAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABwqw0/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUArgwMEI3xyX8AAAAASUVORK5CYII="
        ]),
        xy_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjdJst8J+BgYFhV+oHRhANA3AOugIUVSDVMAUAq7gJ9D/YRzoAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjdJst8J+BgYFhV+oHRhANA3AOugIUVSDVMAUAq7gJ9D/YRzoAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjDLPS/M/AwMCw6th1RhANA3AOugIUVSDVMAUApqcJvCU2eKsAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjLAyw/c/AwMDQv+EwI4iGATgHXQGKKpBqmAIArOEKAV016sgAAAAASUVORK5CYII="
        ]),
        yx_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADbrMF/oOEGGHiMIFdqR/AYozoAjCFAESYCfRX84mzAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADbrMF/oOEGGHiMIFdqR/AYozoAjCFAESYCfRX84mzAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADhQG2/0FCjDBxmED/hsNgMUZ0AZhCAEhLCgHpEoAuAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADYVaa/0FCjDBxmMCqY9fBYozoAjCFADSXCbwgOfcSAAAAAElFTkSuQmCC"
        ]),
        corners: load_colors("RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w cVA9/w Vjop/w cVA9/w Vjop/w"),
        is_opaque: true
    },
    2: { // dirt
        faces: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjLAyw/d+/4TAjAxbACJKEiaMrQpFEV4RVEqaIeJ1Y7cTlWgD4lRoFbIuvpQAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABCgNs/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUAa4IN82JsOVMAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjLAyw/d+/4TAjAxbACJKEiaMrQpFEV4RVEqaIeJ1Y7cTlWgD4lRoFbIuvpQAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABCgNs/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUAa4IN82JsOVMAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjDLPS/L/q2HVGBiyAESQJE0dXhCKJrgirJEwR8Tqx2onLtQDGbBnAGFGi6QAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABwqw0/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUArgwMEI3xyX8AAAAASUVORK5CYII="
        ]),
        xy_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjLAyw/c/AwMDQv+EwI4iGATgHXQGKKpBqmAIArOEKAV016sgAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjLAyw/c/AwMDQv+EwI4iGATgHXQGKKpBqmAIArOEKAV016sgAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjDLPS/M/AwMCw6th1RhANA3AOugIUVSDVMAUApqcJvCU2eKsAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjLAyw/c/AwMDQv+EwI4iGATgHXQGKKpBqmAIArOEKAV016sgAAAAASUVORK5CYII="
        ]),
        yx_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADhQG2/0FCjDBxmED/hsNgMUZ0AZhCAEhLCgHpEoAuAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADhQG2/0FCjDBxmED/hsNgMUZ0AZhCAEhLCgHpEoAuAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADhQG2/0FCjDBxmED/hsNgMUZ0AZhCAEhLCgHpEoAuAAAAAElFTkSuQmCC",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACBJREFUGFdjZEADYVaa/0FCjDBxmMCqY9fBYozoAjCFADSXCbwgOfcSAAAAAElFTkSuQmCC"
        ]),
        corners: load_colors("RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w cVA9/w Vjop/w cVA9/w Vjop/w"),
        is_opaque: true
    },
    3: { // stone
        faces: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjTD6s9H+u7T1GBiyAESQJE0dXhCKJrgirJEwR8Tqx2onLtQAudRpPmWngYwAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABkg8r/WdElwMJwsTgksiCcElsgsTpJMpObIoANtgP+UvDHhsAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjLAyw/d+/4TAjAxbACJKEiaMrQpFEV4RVEqaIeJ1Y7cTlWgD4lRoFbIuvpQAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABCgNs/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUAa4IN82JsOVMAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACpJREFUGFdjDLPS/L/q2HVGBiyAESQJE0dXhCKJrgirJEwR8Tqx2onLtQDGbBnAGFGi6QAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IArs4c6QAAACVJREFUGFdjZMABwqw0/zOiy4EEYWJwSWRBuCQ2QeJ0EmUnNkUArgwMEI3xyX8AAAAASUVORK5CYII="
        ]),
        xy_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjdJst8J+BgYFhV+oHRhANA3AOugIUVSDVMAUAq7gJ9D/YRzoAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjdJst8J+BgYFhV+oHRhANA3AOugIUVSDVMAUAq7gJ9D/YRzoAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjDLPS/M/AwMCw6th1RhANA3AOugIUVSDVMAUApqcJvCU2eKsAAAAASUVORK5CYII=",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAACJJREFUGFdjLAyw/c/AwMDQv+EwI4iGATgHXQGKKpBqmAIArOEKAV016sgAAAAASUVORK5CYII="
        ]),
        yx_bords: load_imgs([
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAAA9JREFUGFdjZMABGEmWAAAA4QAEI1qlswAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAAA9JREFUGFdjZMABGEmWAAAA4QAEI1qlswAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAAA9JREFUGFdjZMABGEmWAAAA4QAEI1qlswAAAABJRU5ErkJggg==",
            "iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAAAXNSR0IArs4c6QAAAA9JREFUGFdjZMABGEmWAAAA4QAEI1qlswAAAABJRU5ErkJggg=="
        ]),
        corners: load_colors("RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w RpsQ/w cVA9/w Vjop/w cVA9/w Vjop/w"),
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
            tri.push({
                block_id: b,
                block_pos: [-(x + xy + r + y), y, -(xy + y)],
                face_id: r,
                face_img: blocks[b].faces[r],
                z_index: y * 3 + 2
            });
            
            if (blocks[b].is_opaque) break;
        }
        
        b = load_block(-(x + xy + y), y, -(xy + y) + (1 - r));
        
        if (b != 0) {
            tri.push({
                block_id: b,
                block_pos: [-(x + xy + y), y, -(xy + y) + (1 - r)],
                face_id: r * 3 + 2,
                face_img: blocks[b].faces[r * 3 + 2],
                z_index: y * 3 + 1
            });
            
            if (blocks[b].is_opaque) break;
        }
        
        b = load_block(-(x + xy + y) + (1 - r), y, -(xy + y) + 1);
        
        if (b != 0) {
            tri.push({
                block_id: b,
                block_pos: [-(x + xy + y) + (1 - r), y, -(xy + y) + 1],
                face_id: 4 - r,
                face_img: blocks[b].faces[4 - r],
                z_index: y * 3
            });
            
            if (blocks[b].is_opaque) break;
        }
    }
    
    tris.set(x + "," + xy + "," + r, tri);
    
    return tri;
}

function mod_8(n) {
    return (n % 8 + 8) % 8;
}

function pix_to_iso(x, y) {
    var ix = Math.floor(x / 8);
    var iy = y - Math.floor((x + 1) / 2);
    var ixy = Math.floor(iy / 8);
    var ir = mod_8(iy) < 8 - Math.floor((mod_8(x) + 1) / 2) * 2 ? 0 : 1;
    
    return [ix, ixy, ir];
}

function iso_to_face_pix(ix, ixy, ir) {
    return [
        ix * 8 + ir,
        ix * 4 + ixy * 8 + ir * 4 + 1
    ];
}

function load_pix_color(x, y) {
    var is_xy_bord = mod_8(Math.floor(x / 2) - y) == 7;
    var is_yx_bord = mod_8(Math.floor(x / 2) + y) == 7;
    var is_y_bord_0 = mod_8(x) == 7;
    var is_y_bord_1 = mod_8(x) == 0;
    var is_y_bord = is_y_bord_0 || is_y_bord_1;
    var is_corner = is_xy_bord && is_yx_bord;
    var is_face = !(is_xy_bord || is_yx_bord || is_y_bord);
    
    // return is_corner ? "#000000" : is_pq_bord ? "#008800" : is_qp_bord ? "#880000" : is_p_bord_0 ? "#008888" : is_p_bord_1 ? "#000088" : "#dddddd";
    
    var tri_x = Math.floor(x / 8);
    var tri_xy = Math.floor((y - Math.floor((x + 1) / 2)) / 8);
    // var tri_r = y - tri_xy * 8 - tri_x * 4 - (tri_x % 2 + 2) % 2 * 4 > 8 - mod_8(x / 2) ? 1 : 0; // todo: could prolly simplify
    var tri_r = mod_8(y - Math.floor((x + 1) / 2)) < 8 - Math.floor((mod_8(x) + 1) / 2) * 2 ? 0 : 1;
    var tri = [tri_x, tri_xy, tri_r];
    
    var subtri_x = mod_8(x) - 2;
    var subtri_y = y - tri_xy * 8 - tri_x * 4 - 2;
    var subtri_norm_y = subtri_y - Math.floor(subtri_x / 2) - (subtri_y > 4 - Math.floor(subtri_x / 2) ? 1 : 0);
    var subtri = subtri_x + subtri_norm_y * 6;
    
    // return x == 0 && y == 0 ? "#ffffff" : is_face ? /*hsl_to_rgb(180, (tri_x * 10 % 100 + 100) % 100, ((tri_xy * 2 + tri_r) * 10 % 100 + 100) % 100)*/ hsl_to_rgb(subtri * 10, 80, 70) : "#000000";
    return x == 0 && y == 0 ? "#ff0000" : hsl_to_rgb(is_face ? 190 : 190, (tri_x * 10 % 100 + 100) % 100, ((tri_xy * 2 + tri_r) * 10 % 100 + 100) % 100);
    
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

function pix_is(p_0, p_1) {
    return p_0[0] == p_1[0] && p_0[1] == p_1[1] && p_0[2] == p_1[2];
}

function pix_is_with_offset(p_0, p_1, offset) {
    return p_0[0] + offset[0] == p_1[0] && p_0[1] + offset[1] == p_1[1] && p_0[2] + offset[2] == p_1[2];
}

function load_tile(tx, ty) {
    if (tiles.has(tx + "," + ty)) return tiles.get(tx + "," + ty);

    var tile = document.createElement("canvas");
    var t_2d = tile.getContext("2d");

    tile.width = TILE_SIZE;
    tile.height = TILE_SIZE;

    var x, y;

    for (x = 0; x < TILE_SIZE; x++) for (y = 0; y < TILE_SIZE; y++) {
        // t_2d.fillStyle = load_pix_color(tx * TILE_SIZE + x, ty * TILE_SIZE + y);
        // t_2d.fillRect(x, y, 1, 1);
    }
    
    var min_x = tx * TILE_SIZE;
    var min_y = ty * TILE_SIZE;
    var max_x = (tx + 1) * TILE_SIZE - 1;
    var max_y = (ty + 1) * TILE_SIZE - 1;
    
    var min_ix = Math.floor(min_x / 8);
    var max_ix = Math.ceil(max_x / 8);
    
    var min_iso, max_iso, ixy, ir, fp;
    
    for (var ix = min_ix; ix <= max_ix; ix++) {
        min_iso = pix_to_iso(ix * 8 + 7, min_y);
        max_iso = pix_to_iso(ix * 8, max_y);
        
        ixy = min_iso[1];
        ir = 0;
        
        while (ixy <= max_iso[1]) {
            fp = iso_to_face_pix(ix, ixy, ir);
            
            t_2d.drawImage(load_tri(ix, ixy, ir)[0].face_img, fp[0] - min_x, fp[1] - min_y);
            
            if (ir == 1) { // xy-bord
                var f_0 = load_tri(ix, ixy + 1, 0);
                var f_1 = load_tri(ix, ixy, 1);
                
                if (f_0.length != 0 && f_1.length != 0) {
                    if (pix_is(f_0[0].block_pos, f_1[0].block_pos)) {
                        t_2d.drawImage(blocks[f_0[0].block_id].xy_bords[Math.floor(f_1[0].face_id / 2) == 0 ? 1 : 2], fp[0] - min_x, fp[1] - min_y + 4);
                    } else if (pix_is_with_offset(f_0[0].block_pos, f_1[0].block_pos, [0, 0, 1]) && f_0[0].block_id + "," + f_1[0].block_id in overrides.xy_top_bords) {
                        t_2d.drawImage(overrides.xy_top_bords[f_0[0].block_id + "," + f_1[0].block_id], fp[0] - min_x, fp[1] - min_y + 4);
                    } else if (false) { // side offset
                    } else if (f_0[0].z_index > f_1[0].z_index || pix_is_with_offset(f_0[0].block_pos, f_1[0].block_pos, [0, 1, 1])) {
                        t_2d.fillStyle = "#ff0000";
                        t_2d.fillRect(fp[0] - min_x + 1, fp[1] - min_y + 4, 1, 1);
                        t_2d.drawImage(blocks[f_0[0].block_id].xy_bords[0], fp[0] - min_x, fp[1] - min_y + 4);
                    } else {
                        t_2d.drawImage(blocks[f_0[0].block_id].xy_bords[3], fp[0] - min_x, fp[1] - min_y + 4);
                    }
                } else if (f_0.length != 0) { // no f_1
                } else if (f_1.length != 0) { // no f_0
                }
            } else { // yx-bord
                var f_0 = load_tri(ix, ixy, 0);
                var f_1 = load_tri(ix, ixy, 1);
                
                if (f_0.length != 0 && f_1.length != 0) {
                    if (pix_is(f_0[0].block_pos, f_1[0].block_pos)) {
                        t_2d.drawImage(blocks[f_0[0].block_id].yx_bords[Math.floor(f_0[0].face_id / 2) == 0 ? 1 : 2], fp[0] - min_x + 1, fp[1] - min_y + 4);
                    } else if (pix_is_with_offset(f_0[0].block_pos, f_1[0].block_pos, [-1, 0, 0]) && f_0[0].block_id + "," + f_1[0].block_id in overrides.yx_top_bords) {
                        t_2d.drawImage(overrides.yx_top_bords[f_0[0].block_id + "," + f_1[0].block_id], fp[0] - min_x + 1, fp[1] - min_y + 4);
                    } else if (false) { // side offset
                    } else if (f_1[0].z_index > f_0[0].z_index || pix_is_with_offset(f_0[0].block_pos, f_1[0].block_pos, [-1, -1, 0])) {
                        t_2d.drawImage(blocks[f_1[0].block_id].yx_bords[0], fp[0] - min_x + 1, fp[1] - min_y + 4);
                    } else {
                        t_2d.drawImage(blocks[f_0[0].block_id].yx_bords[3], fp[0] - min_x + 1, fp[1] - min_y + 4);
                    }
                } else if (f_0.length != 0) { // no f_1
                } else if (f_1.length != 0) { // no f_0
                }
            }
            
            ixy += ir;
            ir = 1 - ir;
        }
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
    
    c_2d.fillStyle = "#ffffff";
    c_2d.fillRect(disp_size[0] / 2 - 1, disp_size[1] / 2 - 8, 2, 16);
    c_2d.fillRect(disp_size[0] / 2 - 8, disp_size[1] / 2 - 1, 16, 2);
    
    if (mouse_offset) {
        c_2d.textAlign = "left";
        c_2d.textBaseline = "bottom";
        c_2d.font = "10px sans-serif";
        
        var x = Math.floor(cam[0] + (mouse_offset[0] - Math.floor(disp_size[0] / 2)) / pix_size);
        var y = Math.floor(cam[1] + (mouse_offset[1] - Math.floor(disp_size[1] / 2)) / pix_size);
        
        var lines = [
            mouse_offset[0] + ", " + mouse_offset[1],
            "pix: " + x + ", " + y,
            "tri: " + pix_to_iso(x, y).join(", "),
            "blocks: " + load_tri(...pix_to_iso(x, y)).map(t => t.block_pos.join(", ")).join("; ")
        ];
        
        c_2d.fillStyle = "rgba(0, 0, 0, 0.5)";
        c_2d.fillRect(mouse_offset[0] + 2, mouse_offset[1] - 2, lines.reduce((w, t) => Math.max(w, c_2d.measureText(t).width), 0) + 8, -(10 * lines.length + 8));
        
        c_2d.fillStyle = "#ffffff";
        for (var i = 0; i < lines.length; i++) c_2d.fillText(lines[i], mouse_offset[0] + 6, mouse_offset[1] - 6 - (lines.length - i - 1) * 10);
    }
}

function resize() {
    disp_size = [window.innerWidth, window.innerHeight];
    pix_size = Math.round(Math.sqrt((disp_size[0] * disp_size[1]) / (256 * 16 * 8)));
    
    canvas.width = disp_size[0];
    canvas.height = disp_size[1];
    c_2d.imageSmoothingEnabled = false;

    draw();
}

window.addEventListener("resize", resize, false);

function render_chunk_terrain(chx, chy) {
    var terrain_height_map = [...Array(CHUNK_SIZE)].map((_, x) => [...Array(CHUNK_SIZE)].map((_, y) => terrain_height(x, y)));
    
    
}