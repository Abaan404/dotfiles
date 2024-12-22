{ ... }:

{
  environment.variables = {
    # https://wiki.archlinux.org/title/Hardware_video_acceleration
    "VDPAU_DRIVER" = "radeonsi";
    "LIBVA_DRIVER_NAME" = "radeonsi";
  };
}
