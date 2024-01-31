const MIN_TERRAIN_Y = -17;
const MAX_TERRAIN_Y = 17;

function terrain_height(x, y) {
    function chunk_noise(x, y, chunk_size, chunk_grid_seed) {
        var cx = Math.floor(x / chunk_size);
        var cy = Math.floor(y / chunk_size);
        
        var xs = x / chunk_size - cx;
        var ys = y / chunk_size - cy;
        
        function interpolate_2d(x0y0, x0y1, x1y0, x1y1, xw, yw) {
            return x0y0 * (1 - xw) * (1 - yw) + x0y1 * (1 - xw) * yw + x1y0 * xw * (1 - yw) + x1y1 * xw * yw;
        }

        function dot_grid_gradient(ix, iy, grid_dir) {
            return (xs - ix) * Math.cos(grid_dir) + (ys - iy) * Math.sin(grid_dir);
        }
        
        function fnv_chunk_grid_dir(chunk_grid_seed, x, y) {
            return fnv_hash(i32s_to_bytes([chunk_grid_seed, x, y])) * 1.4629180792671596e-9;
        }

        var x0y0 = dot_grid_gradient(0, 0, fnv_chunk_grid_dir(chunk_grid_seed, cx, cy));
        var x0y1 = dot_grid_gradient(0, 1, fnv_chunk_grid_dir(chunk_grid_seed, cx, cy + 1));
        var x1y0 = dot_grid_gradient(1, 0, fnv_chunk_grid_dir(chunk_grid_seed, cx + 1, cy));
        var x1y1 = dot_grid_gradient(1, 1, fnv_chunk_grid_dir(chunk_grid_seed, cx + 1, cy + 1));

        function smoothstep(x) {
            return x * x * (3 - x * 2);
        }

        return interpolate_2d(x0y0, x0y1, x1y0, x1y1, smoothstep(xs), smoothstep(ys));
    }
    
    return Math.round(chunk_noise(x, y, 16, chunk_16_grid_seed) * 16 + chunk_noise(x, y, 4, chunk_4_grid_seed) * 8);
}

function load_block(x, y, z) {
    var h = terrain_height(x, z);
    
    return y > h ? 0 : y == h ? 1 : y == h - 1 ? 2 : 3;
}