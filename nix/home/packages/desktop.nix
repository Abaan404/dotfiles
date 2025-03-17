{ pkgs, pkgs-unstable, inputs, ... }:

{
  home.packages = [
    # browser
    pkgs.firefox
    inputs.zen-browser.packages.${pkgs.system}.twilight-official

    # file manager
    pkgs.dolphin
    pkgs.kdePackages.kdegraphics-thumbnailers
    pkgs.kdePackages.kio-extras-kf5
    pkgs.kdePackages.kio-fuse
    pkgs.kdePackages.qtsvg
    pkgs.kdePackages.qtimageformats
    pkgs.qdirstat
    pkgs.kdePackages.ark

    # media
    pkgs.pavucontrol
    pkgs.spotify
    pkgs.sonusmix
    pkgs.vlc

    # word processing
    pkgs-unstable.typst
    pkgs.styluslabs-write
    pkgs.fritzing
    pkgs.libreoffice-fresh
    pkgs.hunspell
    pkgs.hunspellDicts.uk_UA
    pkgs.tectonic
    pkgs.zathura
    pkgs.swayimg
    pkgs.okular

    # gamging
    pkgs.tetrio-desktop
    pkgs.prismlauncher
    pkgs.vesktop

    # wine
    pkgs.wineWowPackages.staging
    pkgs.bottles
    pkgs.lutris

    # image/video editing
    pkgs.kolourpaint
    pkgs.inkscape
    pkgs.swappy
    pkgs.kooha
    pkgs.krita
    pkgs.gimp

    # theming
    pkgs.kdePackages.qtstyleplugin-kvantum
    pkgs.libsForQt5.qtstyleplugin-kvantum
    pkgs.libsForQt5.qt5ct
    pkgs.qt6ct
    pkgs.zenity

    # networking
    pkgs.blueman
    pkgs.networkmanagerapplet
    pkgs.openconnect
    pkgs.networkmanager-openconnect

    # vnc
    pkgs.tigervnc
  ];

  services.kdeconnect = {
    enable = true;
  };

  fonts.fontconfig = {
    enable = true;

    defaultFonts = {
      # monospace abuse
      serif = [ "JetBrainsMono Nerd Font" ];
      sansSerif = [ "JetBrainsMono Nerd Font" ];
      monospace = [ "JetBrainsMono Nerd Font" ];
    };
  };

  home.pointerCursor = {
    gtk.enable = true;
    package = pkgs.bibata-cursors;
    name = "Bibata-Modern-Ice";
    size = 24;
  };

  gtk = {
    enable = true;

    font = {
      name = "JetBrainsMono Nerd Font";
      size = 11;
    };

    iconTheme = {
      package = pkgs.tela-icon-theme;
      name = "Tela-dark";
    };

    theme = {
      package = pkgs.qogir-theme;
      name = "Qogir-Dark";
    };
  };

  qt = {
    enable = true;
    platformTheme.name = "qt5ct";

    style = {
      name = "kvantum";
      package = pkgs.layan-kde;
    };
  };

  programs.obs-studio = {
    enable = true;
    plugins = [
      pkgs.obs-studio-plugins.wlrobs
      pkgs.obs-studio-plugins.obs-backgroundremoval
      pkgs.obs-studio-plugins.obs-pipewire-audio-capture
    ];
  };
}
