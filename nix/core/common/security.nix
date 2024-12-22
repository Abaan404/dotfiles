{ ... }:

{
  security = {
    polkit.enable = true;
    rtkit.enable = true;
  };

  networking.firewall = {
    enable = true;

    allowedTCPPorts = [
      22
      8080
      8000
    ];

    allowedTCPPortRanges = [
      # KDE Connect
      {
        from = 1714;
        to = 1764;
      }
    ];
    allowedUDPPortRanges = [
      # KDE Connect
      {
        from = 1714;
        to = 1764;
      }
    ];
  };
}
