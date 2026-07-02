{ ... }:

{
  services.xserver.videoDrivers = [
    "amdgpu"
  ];

  # prevent bluetooth devices from switcingh profiles when trying to record from it
  # will cause bluetooth mics to not work intentionally
  services.pipewire.wireplumber.extraConfig."51-disable-bt-autoswitch" = {
    "wireplumber.settings" = {
      "bluetooth.autoswitch-to-headset-profile" = false;
    };
  };
}
