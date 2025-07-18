{
  pkgs,
  pkgs-unstable,
  inputs,
  ...
}:

{
  home.packages = [
    # browser
    pkgs.firefox
    inputs.zen-browser.packages.${pkgs.system}.twilight-official

    # file manager
    pkgs.libsForQt5.dolphin
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

    # notetaking
    pkgs.kdePackages.okular
    pkgs.styluslabs-write
    pkgs.tectonic
    pkgs.typst

    # word processing
    pkgs.libreoffice-fresh
    pkgs.hunspell
    pkgs.hunspellDicts.uk_UA
    pkgs.swayimg

    # gamging
    pkgs.tetrio-desktop
    pkgs.prismlauncher
    pkgs.vesktop

    # wine
    pkgs.wineWowPackages.staging
    pkgs.bottles
    pkgs.lutris
    pkgs.mangohud

    # image/video editing
    pkgs.davinci-resolve
    pkgs.kdePackages.kolourpaint
    pkgs.kdePackages.kdenlive
    pkgs.inkscape
    pkgs.swappy
    pkgs.krita
    pkgs.gimp3

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
    pkgs.wireshark

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
      package = pkgs.orchis-theme;
      name = "Orchis-Dark";
    };
  };

  qt = {
    enable = true;
    platformTheme.name = "qt5ct";

    style = {
      name = "kvantum";
      package = pkgs.utterly-nord-plasma;
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

  programs.zathura = {
    enable = true;
    options = {
      selection-clipboard = "clipboard";
    };
  };

  services.flatpak = {
    enable = true;
    uninstallUnmanaged = false;
    packages = [
      "org.vinegarhq.Sober"
      "org.gnome.gitlab.YaLTeR.VideoTrimmer"
      "io.mrarm.mcpelauncher"
    ];

    overrides = {
      "org.gnome.gitlab.YaLTeR.VideoTrimmer".Context = {
        filesystems = [
          "~/Videos/Replays"
        ];
      };
    };
  };
}
