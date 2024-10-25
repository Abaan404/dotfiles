{ pkgs, pkgs-master, ... }:

{
  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;

  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = [
    pkgs.vim

    # hardware
    pkgs.lshw
    pkgs.usbutils
    # acpi-call # TODO figure out acpi_call
    pkgs.pciutils
    pkgs-master.gpu-screen-recorder
  ];

  programs.dconf = {
    enable = true;
  };

  programs.hyprland = {
    enable = true;
  };

  # Some programs need SUID wrappers, can be configured further or are
  # started in user sessions.
  programs.mtr = {
    enable = true;
  };

  programs.gnupg.agent = {
    enable = true;
    enableSSHSupport = true;
  };

  programs.steam = {
    enable = true;
    remotePlay.openFirewall = true;
    dedicatedServer.openFirewall = true;
    localNetworkGameTransfers.openFirewall = true;
  };

  programs.gpu-screen-recorder = {
    package = pkgs-master.gpu-screen-recorder;
    enable = true;
  };
}
