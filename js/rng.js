const PRNG_mode = {
    I32_PAIR: 0,
    LOSSY: 1,
    BIGINT: 2,
    BYTES: 3,
    STRING: 4,
    STD: 5
};

function xorshift128(seed = null) {
    const modes = [
        (u, l) => [u, l],
        (u, l) => u * (2 ** 32) + l,
        (u, l) => BigInt(u) << 32n | BigInt(l),
        (u, l) => [u >>> 24, u >> 16 & 255, u >> 8 & 255, u & 255, l >>> 24, l >> 16 & 255, l >> 8 && 255, l & 255],
        (u, l) => u.toString(16).padStart(8, "0") + l.toString(16).padStart(8, "0"),
        
    ];
    
    /*if (!seed)
        seed = [
            Math.random() * (2 ** 32),
            Math.random() * (2 ** 32),
            Math.random() * (2 ** 32),
            Math.random() * (2 ** 32)
        ];*/
    
    var state0_u = seed[0] | 0;
    var state0_l = seed[1] | 0;
    var state1_u = seed[2] | 0;
    var state1_l = seed[3] | 0;
    
    function step() {
        var next0_u = state1_u;
        var next0_l = state1_l;
        var next1_u = state0_u;
        var next1_l = state0_l;
        
        state0_u = next0_u;
        state0_l = next0_l;
        
        var xor_u = 0;
        var xor_l = 0;
        
        xor_u = next1_u << 23 | next1_l >>> 9;
        xor_l = next1_l << 23;
        
        next1_u ^= xor_u;
        next1_l ^= xor_l;
        
        xor_u = next1_u >> 17;
        xor_l = next1_l >>> 17 | (next1_u & 32767);
        
        next1_u ^= xor_u;
        next1_l ^= xor_l;
        
        next1_u ^= next0_u;
        next1_l ^= next0_l;
        
        xor_u = next0_u >> 26;
        xor_l = next0_l >>> 26 | (next0_u & 63);
        
        next1_u ^= xor_u;
        next1_l ^= xor_l;
        
        state1_u = next1_u;
        state1_l = next1_l;
        
        var res_l = (next0_l >>> 0) + (next1_l >>> 0);
        var res_u = (next0_u >>> 0) + (next1_u >>> 0) + (res_l >= 4294967296);
        res_l = res_l % 4294967296;
        res_u = res_u % 4294967296;
        
        return [res_u, res_l];
    }
    
    return {
        random_u32_pair: () => step(),
        random_u32: () => step()[1],
        random: () => ((u, l) => u * 2.3283064365386963e-10 + (l >>> 12) * 2.220446049250313e-16)(...step()),
        random_dir: () => ((u, l) => u * 1.4629180792671596e-9 + l * 3.4061215800865545e-19)(...step())
        /*rand_int: (min, max) => { // 
            // max_r = 2**64 - 2**64 % (max - min)
            
            var u, l;
            
            do {
                [u, l] = step();
                
                u = u >>> 0;
                l = l >>> 0;
            } while (u == 0xffffffff && l > 2 ** 32 - 2 ** 32 % (max - min));
            
            return 
        }*/
    };
}

function fnv_hash(bytes) {
    var hash = 0x811c9dc5;
    
    for (var byte of bytes) hash = (hash * 0x811c9dc5) ^ byte;
    
    return hash;
}

function i32s_to_bytes(i32s) {
    return i32s.flatMap(i => [i >>> 24, i >> 16 & 255, i >> 8 & 255, i & 255]);
}