export default function randomIndex(win:Window) {
    // An auxiliary function used to generate a random index
    const rA = new Uint32Array(1);
    win.crypto.getRandomValues(rA)
    return rA[0]
}