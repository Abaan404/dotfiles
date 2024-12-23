import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        stylistic.configs.customize({
            indent: 4,
            quotes: "double",
            semi: true,
        }),
        ...tseslint.configs.stylistic,
    ],

    rules: {
        "@stylistic/jsx-closing-bracket-location": [1, "after-props"],
    },
});
