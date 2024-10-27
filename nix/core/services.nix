{ ... }:

{
  services = {
    pipewire = {
      enable = true;
      pulse.enable = true;
      jack.enable = true;
      alsa = {
        enable = true;
        support32Bit = true;
      };
    };

    gvfs.enable = true;
    dbus.enable = true;
    upower.enable = true;
    accounts-daemon.enable = true;
    udisks2.enable = true;
    openssh.enable = true;
    flatpak.enable = true;

    xserver.videoDrivers = [
      "amdgpu"
      "nvidia"
    ];

  };

  virtualisation = {
    libvirtd.enable = true;
    docker = {
      enable = true;
    };
  };
}
