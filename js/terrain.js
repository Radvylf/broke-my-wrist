const MIN_TERRAIN_Y = -17;
const MAX_TERRAIN_Y = 17;

var chunk_grid_dirs = new Map();
var ground_ys = new Map();

function terrain_height(x, z) {
    function chunk_noise(x, z, chunk_size, chunk_grid_seed) {
        var cx = Math.floor(x / chunk_size);
        var cz = Math.floor(z / chunk_size);
        
        var xs = x / chunk_size - cx;
        var zs = z / chunk_size - cz;
        
        function interpolate_2d(x0z0, x0z1, x1z0, x1z1, xw, zw) {
            return x0z0 * (1 - xw) * (1 - zw) + x0z1 * (1 - xw) * zw + x1z0 * xw * (1 - zw) + x1z1 * xw * zw;
        }

        function dot_grid_gradient(ix, iz, grid_dir) {
            return (xs - ix) * Math.cos(grid_dir) + (zs - iz) * Math.sin(grid_dir);
        }
        
        function fnv_chunk_grid_dir(chunk_grid_seed, x, z) {
            var known = chunk_grid_dirs.get(chunk_grid_seed + "," + x + "," + z);
            
            if (known != undefined) return known;
            
            var dir = fnv_hash(i32s_to_bytes([chunk_grid_seed, x, z])) * 1.4629180792671596e-9;
            
            chunk_grid_dirs.set(chunk_grid_seed + "," + x + "," + z, dir);
            
            return dir;
        }

        var x0z0 = dot_grid_gradient(0, 0, fnv_chunk_grid_dir(chunk_grid_seed, cx, cz));
        var x0z1 = dot_grid_gradient(0, 1, fnv_chunk_grid_dir(chunk_grid_seed, cx, cz + 1));
        var x1z0 = dot_grid_gradient(1, 0, fnv_chunk_grid_dir(chunk_grid_seed, cx + 1, cz));
        var x1z1 = dot_grid_gradient(1, 1, fnv_chunk_grid_dir(chunk_grid_seed, cx + 1, cz + 1));

        function smoothstep(x) {
            return x * x * (3 - x * 2);
        }

        return interpolate_2d(x0z0, x0z1, x1z0, x1z1, smoothstep(xs), smoothstep(zs));
    }
    
    var known = ground_ys.get(x + "," + z);
    
    if (known != undefined) return known;
    
    var y = Math.round(chunk_noise(x, z, 16, chunk_16_grid_seed) * 16 + chunk_noise(x, z, 4, chunk_4_grid_seed) * 8);
    
    ground_ys.set(x + "," + z, y);
    
    return y;
}

var pblocks = new Set(["0,0,0", "0,0,1", "1,0,0", "1,1,1", "1,1,0", "1,2,1", "0,2,1", "-1,1,0"]);

function load_block(x, y, z) {
    var h = terrain_height(x, z);
    
    return y > h ? 0 : y == h ? 1 : y == h - 1 ? 2 : 3;
    
    return pblocks.has(x + "," + y + "," + z) ? 4 : 0;
}