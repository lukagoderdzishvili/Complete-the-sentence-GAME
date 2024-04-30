export function toggleFullScreen(): void{
    if (!(<any>document).fullscreenElement &&    // alternative standard method
        !(<any>document).mozFullScreenElement && !(<any>document).webkitFullscreenElement) {  // current working methods
        if ((<any>document).documentElement.requestFullscreen) {
        (<any>document).documentElement.requestFullscreen();
        } else if ((<any>document).documentElement.mozRequestFullScreen) {
        (<any>document).documentElement.mozRequestFullScreen();
        } else if ((<any>document).documentElement.webkitRequestFullscreen) {
        (<any>document).documentElement.webkitRequestFullscreen();
        }
    } else {
        if ((<any>document).cancelFullScreen) {
            (<any>document).cancelFullScreen();
        } else if ((<any>document).mozCancelFullScreen) {
            (<any>document).mozCancelFullScreen();
        } else if ((<any>document).webkitCancelFullScreen) {
        (<any>document).webkitCancelFullScreen();
        }
    }
}