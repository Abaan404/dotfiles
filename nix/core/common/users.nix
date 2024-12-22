{ ... }:

{
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
}
