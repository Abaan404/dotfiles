{ pkgs, ... }:

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
    power-profiles-daemon.enable = true;
    accounts-daemon.enable = true;
    input-remapper.enable = true;
    udisks2.enable = true;
    openssh.enable = true;
    flatpak.enable = true;
  };

  virtualisation = {
    libvirtd = {
      enable = true;
      qemu.vhostUserPackages = [ pkgs.virtiofsd ];
    };
    docker = {
      enable = true;
    };
  };
}
