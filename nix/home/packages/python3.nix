{ pkgs, ... }:

{
  home.packages = [
    (pkgs.python311.withPackages (pypkgs: [
      # data sci
      pypkgs.pandas
      pypkgs.numpy
      pypkgs.scipy
      pypkgs.sympy
      pypkgs.matplotlib

      # networking
      pypkgs.python-dotenv
      pypkgs.requests
      pypkgs.pybluez

      # rendering
      pypkgs.pillow
      pypkgs.pygame

      # pywal
      pypkgs.colorthief
      pypkgs.pywal
    ]))
  ];
}
