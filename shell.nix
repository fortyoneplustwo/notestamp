{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "notestamp";

  buildInputs = with pkgs; [
    nodejs_22
    pnpm
		firebase-tools
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo "notestamp dev shell (node $(node -v), pnpm $(pnpm -v))"
    echo "run: pnpm install && pnpm start"
  '';
}
