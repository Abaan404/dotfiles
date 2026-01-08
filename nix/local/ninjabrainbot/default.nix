# source: https://github.com/MarwinKreuzig/nixos-config/blob/main/modules/gaming/mcsr/packages/ninjabrainbot/default.nix
# modified for a minimal package

{ pkgs }:
pkgs.maven.buildMavenPackage rec {
  pname = "ninjabrainbot";
  version = "1.5.1";

  src = pkgs.fetchFromGitHub {
    owner = "Ninjabrain1";
    repo = "Ninjabrain-Bot";
    rev = version;
    hash = "sha256-r8TpL3VLf2QHwFS+DdjxgxyuZu167fP6/lN7a8e9opM=";
  };
  mvnHash = "sha256-zAVPH5a7ut21Ipz5BUY6cnRLT52bM8Yo2r8ClFon1p0=";

  mvnDepsParameters = "assembly:single -DskipTests=true";
  mvnParameters = "assembly:single -DskipTests=true";

  nativeBuildInputs = [
    pkgs.makeWrapper
  ];

  installPhase = ''
    install -Dm644 target/ninjabrainbot-${version}-jar-with-dependencies.jar $out/share/Ninjabrain-Bot-${version}.jar

    makeWrapper ${pkgs.jre}/bin/java $out/bin/ninjabrainbot \
      --prefix LD_LIBRARY_PATH : "${
        pkgs.lib.makeLibraryPath [
          pkgs.libxkbcommon
          pkgs.xorg.libX11
          pkgs.xorg.libXt
          pkgs.xorg.libXtst
          pkgs.xorg.libXinerama
          pkgs.xorg.libxcb
        ]
      }" \
      --add-flags "-Dawt.useSystemAAFontSettings=on -jar $out/share/Ninjabrain-Bot-${version}.jar"
  '';
}
