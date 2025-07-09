{ pkgs, ... }:

{
  # Add fonts
  fonts = {
    fontDir.enable = true;
    packages = [
      pkgs.liberation_ttf
      pkgs.font-awesome
      pkgs.nerd-fonts.jetbrains-mono
    ];
  };

  # Set your time zone.
  time.timeZone = "America/Regina";

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
