let overlay_cycle = 0;

function initOverlay() {
    const overlay = document.querySelector("#overlay");
    const fps_display = document.querySelector("#framerate");
    const camera_display = document.querySelector("#camera");
    const chunk_display = document.querySelector("#chunk");
    const fps_node = document.createTextNode("");
    const camera_node = document.createTextNode("");
    const chunk_node = document.createTextNode("");
    fps_display.appendChild(fps_node);
    camera_display.appendChild(camera_node);
    chunk_display.appendChild(chunk_node);

    return {fps_node, camera_node, chunk_node};
}

function updateOverlay(overlays, deltaTime, Camera, world, visible) {
    overlay.style.display = visible ? "block" : "none";
    if(overlay_cycle++ % 10 == 0)
        overlays.fps_node.nodeValue = (1 / deltaTime).toFixed(2);
    overlays.camera_node.nodeValue = Camera.position[0].toFixed(2) + ", " + Camera.position[1].toFixed(2) + ", " + Camera.position[2].toFixed(2);
    let player_chunk = world.getChunk(Camera.position[0], Camera.position[2]);
    if(player_chunk != null)
        overlays.chunk_node.nodeValue = player_chunk.x + ", " + player_chunk.z;
}

export { initOverlay, updateOverlay };