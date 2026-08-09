{
  pkgs,
  inputs,
  config,
  ...
}:

{
  home.packages = [
    # hyprutils
    pkgs.hyprpicker
    pkgs.hyprlock
    pkgs.hypridle
    pkgs.pyprland

    # screenshot
    pkgs.satty
    pkgs.slurp
    pkgs.grim

    # theming
    inputs.local.packages.${pkgs.stdenv.hostPlatform.system}.switch-theme
    pkgs.qtcreator

    # polkit
    pkgs.hyprpolkitagent

    # wallpaper
    pkgs.awww

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
  ];

  programs.rofi = {
    enable = true;
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
      pkgs.rofi-calc
    ];
  };

  programs.ags = {
    enable = true;

    extraPackages = [
      pkgs.glib-networking
      pkgs.libadwaita
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.astal4
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.io
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.apps
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.auth
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.battery
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.hyprland
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.mpris
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.network
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.bluetooth
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.powerprofiles
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.tray
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.wireplumber
      inputs.astal.packages.${pkgs.stdenv.hostPlatform.system}.notifd
    ];
  };

  programs.quickshell = {
    enable = true;
    # Using custom singletons is not picked up by qmllint so doing this in order to supply a qmldir
    package = pkgs.symlinkJoin {
      name = "quickshell-localmodule";
      paths = [ inputs.quickshell.packages.${pkgs.stdenv.hostPlatform.system}.quickshell ];
      buildInputs = [ pkgs.makeWrapper ];
      postBuild = ''
        wrapProgram $out/bin/quickshell \
          --set QML_IMPORT_PATH "${config.xdg.configHome}/quickshell/modules/"
      '';
    };
  };

  wayland.windowManager.hyprland = {
    enable = true;

    extraConfig = ''
      require("animations")
      require("environment")
      require("keybinds")
      require("rules")
      -- require("hyprgrass")

      hl.env("XCURSOR_THEME", "Bibata-Modern-Ice")
      hl.env("XCURSOR_SIZE", "24")
    '';

    plugins = [
      # https://github.com/NixOS/nixpkgs/issues/502324
      # pkgs.hyprlandPlugins.hyprgrass
    ];
  };
}
