{ ... }:

{
  networking = {
    hostName = "nixos";

    networkmanager = {
      enable = true;
    };

    wireless = {
        enable = true;
    };
  };

  hardware.bluetooth = {
    enable = true;
    settings = {
      General = {
        ControllerMode = "dual";
        FastConnectable = true;
        Experimental = true;
        Enable = "Source,Sink,Media,Socket";
      };
    };
  };
}
