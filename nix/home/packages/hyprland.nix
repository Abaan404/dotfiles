{ pkgs, inputs, ... }:

{
  home.packages = [
    # hyprutils
    pkgs.hyprpicker
    pkgs.hyprlock
    pkgs.hypridle
    pkgs.pyprland

    # screenshot
    pkgs.swappy
    pkgs.slurp
    pkgs.grim

    # theming
    inputs.switch-theme.packages.${pkgs.system}.default

    # polkit
    pkgs.hyprpolkitagent

    # wallpaper
    inputs.swww.packages.${pkgs.system}.default

    # notifications
    pkgs.libnotify

    # onscreen keyboard
    (pkgs.wvkbd.overrideAttrs (old: {
      src = pkgs.fetchFromGitHub {
        owner = "abaan404";
        repo = "wvkbd";
        rev = "06ea8ee72a61ed216bcd8fa85cbe9a31d80ee0af";
        hash = "sha256-9sHc7/zmlmXwn7m1uJrc9/BM+fSfmz/oFj0oEE5lTOg=";
      };
    }))

    # misc
    pkgs.just
    pkgs.wev
    inputs.envycontrol.packages.${pkgs.system}.envycontrol
  ];

  programs.rofi = {
    enable = true;
    package = pkgs.rofi-wayland;
    font = "JetBrainsMono NF Extra-Bold 12";
    theme = "~/.config/rofi/theme.rasi";
    extraConfig = {
      modes = "drun,window,calc";

      show-icons = true;

      drun-display-format = "{name}";
      hover-select = true;
      matching = "regex";

      drun-use-desktop-cache = true;
      drun-reload-desktop-cache = true;

      kb-primary-paste = "Control+V,Shift+Insert";
      kb-secondary-paste = "Control+v,Insert";
    };
    plugins = [
      (pkgs.rofi-calc.override { rofi-unwrapped = pkgs.rofi-wayland-unwrapped; })
    ];
  };

  programs.ags = {
    enable = true;

    extraPackages = [
      pkgs.libadwaita
      inputs.astal.packages.${pkgs.system}.astal4
      inputs.astal.packages.${pkgs.system}.io
      inputs.astal.packages.${pkgs.system}.apps
      inputs.astal.packages.${pkgs.system}.auth
      inputs.astal.packages.${pkgs.system}.battery
      inputs.astal.packages.${pkgs.system}.hyprland
      inputs.astal.packages.${pkgs.system}.mpris
      inputs.astal.packages.${pkgs.system}.network
      inputs.astal.packages.${pkgs.system}.bluetooth
      inputs.astal.packages.${pkgs.system}.powerprofiles
      inputs.astal.packages.${pkgs.system}.tray
      inputs.astal.packages.${pkgs.system}.wireplumber
      inputs.astal.packages.${pkgs.system}.notifd
    ];
  };

  wayland.windowManager.hyprland = {
    enable = true;
    settings = {
      "$mainMod" = "SUPER";
    };

    extraConfig = ''
      monitor=,preferred,auto,1
      monitor=eDP-1,preferred,auto,1,transform,0

      source=~/.config/hypr/environment.conf
      source=~/.config/hypr/scripts.conf
      source=~/.config/hypr/keybinds.conf
      source=~/.config/hypr/rules.conf
      source=~/.config/hypr/animations.conf
      source=~/.config/hypr/hyprgrass.conf
      source=~/.config/hypr/hyprexpo.conf
    '';

    plugins = [
      pkgs.hyprlandPlugins.hyprgrass
      pkgs.hyprlandPlugins.hyprexpo
    ];
  };
}
