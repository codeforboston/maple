{ sources ? import ./nix/sources.nix
, pkgs ? import sources.nixpkgs { }
}:
let
  app = pkgs.python310.withPackages (p: with p; [
    pandas
    peewee
    tqdm
  ]);
in
pkgs.mkShell {
  packages = [
    app
  ];
  buildInputs = [
    pkgs.sqlite
  ];
}
