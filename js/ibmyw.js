var mouse_client = null;
var mouse_offset = null;

window.addEventListener("click", (event) => {
    targ_cam[0] = cam[0] + (event.offsetX - Math.floor(disp_size[0] / 2)) / pix_size;
    targ_cam[1] = cam[1] + (event.offsetY - Math.floor(disp_size[1] / 2)) / pix_size;
}, false);

window.addEventListener("mousemove", (event) => {
    mouse_client = [event.clientX, event.clientY];
    mouse_offset = [event.offsetX, event.offsetY];
}, false);

window.addEventListener("mouseleave", (event) => {
    mouse_client = null;
    mouse_offset = null;
}, false);

window.addEventListener("blur", (event) => {
    mouse_client = null;
    mouse_offset = null;
}, false);

Promise.all(img_promises).then(_ => {
    resize();
    
    window.requestAnimationFrame(frame);
});