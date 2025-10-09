{ pkgs, pkgs-unstable, ... }:

{
  # Add fonts
  fonts = {
    fontDir.enable = true;
    packages = [
      pkgs.liberation_ttf
      pkgs.roboto
      pkgs.source-sans
      pkgs.nerd-fonts.jetbrains-mono
      pkgs-unstable.font-awesome
    ];
  };

  # Select internationalisation properties.
  i18n.defaultLocale = "en_GB.UTF-8";

  # Configure keymap in X11
  services.xserver.xkb = {
    layout = "us";
    variant = "";
  };

  # Configure console keymap
  console.keyMap = "us";
}
