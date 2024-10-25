{ ... }:

{
  imports = [
    ./core/hardware-configuration.nix
    ./core/networking.nix
    ./core/services.nix
    ./core/security.nix
    ./core/packages.nix
    ./core/locale.nix
    ./core/shell.nix
    ./core/boot.nix
  ];

  # Define a user account. Don't forget to set a password with ‘passwd’.
  users.users.abaan404 = {
    isNormalUser = true;
    description = "abaan404";
    extraGroups = [
      "networkmanager"
      "wheel"
      "docker"
      "wireshark"
    ];
  };

  # This value determines the NixOS release from which the default
  # settings for stateful data, like file locations and database versions
  # on your system were taken. It‘s perfectly fine and recommended to leave
  # this value at the release version of the first install of this system.
  # Before changing this value read the documentation for this option
  # (e.g. man configuration.nix or on https://nixos.org/nixos/options.html).
  system.stateVersion = "24.05"; # Did you read the comment?

  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];
}
