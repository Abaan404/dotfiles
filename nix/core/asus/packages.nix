{ pkgs, ... }:

{
  environment.systemPackages = [
    pkgs.nvtopPackages.amd
  ];
}
