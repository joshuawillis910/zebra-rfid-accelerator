const BRAND = {
  // ── IDENTITY ──────────────────────────────────────────────
  company:      "Zebra Technologies",
  product:      "RFID Value Accelerator",
  tagline:      "Capture Your Edge.",

  // ── COLORS — confirmed from Zebra Web Brand Guidelines (Figma) ──
  colors: {
    black:      "#000000",   // Primary — nav, hero backgrounds, CTAs
    white:      "#FFFFFF",   // Surfaces
    green:      "#A8F931",   // Impact Green — accent ONLY, max 20%
    green50:    "#E2FFB6",   // Green tint
    blue:       "#003FBD",   // Blue 700 — links/breadcrumbs only
    gray50:     "#F2F2F2",
    gray100:    "#E6E6E6",
    gray200:    "#BDBDBD",
    gray500:    "#757575",
    gray700:    "#565656",
    gray800:    "#303030",
    // Aliases used by PPTX generator:
    primary:    "#000000",
    dark:       "#000000",
    accent:     "#A8F931",
    light:      "#F2F2F2",
    text:       "#303030",
    kpi:        "#A8F931",
  },

  // ── TYPOGRAPHY — confirmed from Zebra Web Brand Guidelines ──
  fonts: {
    htmlHead:  "'ZebraSansCnd', Arial, sans-serif",
    htmlBody:  "'ZebraSans', Arial, sans-serif",
    htmlMono:  "'ZebraMono', 'Courier New', monospace",
    pptxHead:  'ZebraSans',
    pptxBody:  'ZebraSans',
    pptxMono:  'Courier New',
  },

  // ── LOGO ── swap these paths when you drop in assets ──────────────────
  // FILES GO IN: assets/ folder (same directory as this HTML file)
  // FORMATS:
  //   white  = white-on-transparent  (for black nav bar + exec hero)
  //   color  = full-color version    (optional, for light backgrounds)
  //   pdf    = white PNG 300dpi      (for generate_pdf.py header)
  logos: {
    white:      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjEwMC40NCA1My44NSAxMDAuNDMgNTMuODUgMTAwLjQ0IDUzLjg2IDEwMC40NCA1My44NSIvPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIwIDk0Ljc0IDgyLjgxIDE3Ny4yNyA4Mi44MSAxNTkuNjggMCA3Ny4xMyAwIDk0Ljc0Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTI2LjQsNzkuNzFoMHMtMTIuOTQtMTIuOTQtMTIuOTQtMTIuOTRoLTE3LjdzLTEyLjk2LTEyLjkyLTEyLjk2LTEyLjkyaDE3LjYybC0xMi44Mi0xMi45LTE3Ljc2LjAzTDM1LjI5LDYuNjJjLTIuNzMsMS4xNC04Ljk2LDUuMTgtMTAuNzYsNi43N2wzMi4zNiwzMi4yN3Y3MC40N2wyNS45MSwyNS44MnYtMTcuNjJsLTEyLjk3LTEyLjkydi01Ny41N2gxMi45N3Y1OS4xOGgxMi45NnYtNDYuMjZsMTIuOTMsMTIuOTN2MzMuMzNoMTIuOTZzMC0yMC40NCwwLTIwLjQ0bC0xMi45Ni0xMi44OWgxNy43MVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik05MC40MSwyMC40OGMwLTExLjMyLTkuMTktMjAuNDgtMjAuNTUtMjAuNDh2NDAuOTdjMTEuMzUsMCwyMC41NS05LjE3LDIwLjU1LTIwLjQ4WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQzLjk1LDEwMy4yN3YtNTIuOTRTMTUuNDcsMjEuOTQsMTUuNDcsMjEuOTRjLTIuNjYsMy4wMS01LjQ1LDcuMDktNy4zLDEwLjM0bDIyLjgzLDIyLjc4djE3LjdMMi44MSw0NC42NkMxLjI3LDUwLC4zOCw1NC4zOS4xMSw1OS41N2w0My44Myw0My43aC4wMVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zOTQuMTgsODYuMjhjMTMuMTMtMy4yLDE1Ljk1LTE0LjU2LDE1Ljk1LTIwLjksMC04LjY1LTMuODgtMTYuMzItMTAuMjctMjAuMS01LTMuMTEtMTEuNzktNC4zMi0yMy41OS00LjMyaC4wMXMtMzEuNjMsMC0zMS42Mywwdjg5Ljk5aDM3Ljg4YzkuNDMsMCwxNC45OC0xLjI1LDE5LjU2LTQuMjIsNS45Ny0zLjkxLDkuNDMtMTEuMzIsOS40My0xOS42OCwwLTYuNjEtMi4wNy0xMS44Ny02LjI1LTE1LjY1LTIuOTEtMi43LTUuNDItMy45Mi0xMS4xLTUuMTNaTTM2Ny4xNCw1Ny4yOGg1LjI2YzEwLjUzLDAsMTQuODQsMi45NywxNC44NCwxMC4zOXMtNC4zLDEwLjUxLTE0LjU2LDEwLjUxaC01LjU0di0yMC45Wk0zNzUuMzEsMTE1LjI4aC04LjE5cy4wMS0yMS4xOC4wMS0yMS4xOGg1LjEyYzYuOCwwLDkuMDMuMjYsMTEuNTIsMS42MSwzLjMzLDEuNzYsNSw0Ljg1LDUsOS4xNywwLDcuMjgtNC4wMywxMC4zOS0xMy40NiwxMC4zOVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik01NDMuMTMsNDAuOThoLTI3LjU0bC0yOC4zMiw4Ni44LTE5LjktMzMuNjdoLS4wMWMxMy41OC00LjIyLDE5LjUxLTE0LjI2LDE5LjUxLTI1LjczLDAtMjQuNDMtMjIuMTItMjcuNC0zNC4zMi0yNy40aC0zMi4xMnY4OS45OWgyMi40OXYtMzcuMzJsMjAuMjYsMzcuMzJoNDUuODZsNS40Ny0xNy43MWgyOC44MWw1LjQ3LDE3LjcxaDIzLjUybC0yOS4xOC04OS45OVpNNDQ5Ljc1LDc5Ljk4aC02Ljg2di0yMi42OWg2LjYxYzkuNTMsMCwxNS4zOCwyLjI2LDE1LjM4LDEwLjkzLDAsMTAuNS01Ljg1LDExLjc2LTE1LjEzLDExLjc2Wk01MTkuOTcsOTUuNDJsOC45NC0yOC42OSw4LjkzLDI4LjY5aC0xNy44N1oiLz4KICA8cG9seWdvbiBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMjc3LjM0IDEzMC45NiAzMzMuNjUgMTMwLjk2IDMzMy42NSAxMTMuMjkgMjk5LjA0IDExMy4yOSAyOTkuMDQgOTQuNzEgMzI4LjM4IDk0LjcxIDMyOC4zOCA3Ny4wNSAyOTkuMDQgNzcuMDUgMjk5LjA0IDU4LjY1IDMzMy42NSA1OC42NSAzMzMuNjUgNDAuOTggMjc3LjM0IDQwLjk4IDI3Ny4zNCAxMzAuOTYiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xMzQuNiw5OC44bC0uMDYsMTQuMjJoLTEyLjg5YzAsMTEuMzIsOS4xOSwyMC40OCwyMC41NSwyMC40OHMyMC41NS05LjE3LDIwLjU1LTIwLjQ4aDB2LS4wM2wtMTQuMjUtMTQuMmgtMTMuODlaIi8+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjIwOS44OSA0MC45OCAyMDAuMzQgNTguNjUgMjM0LjYzIDU4LjY1IDE5NS44OSAxMzAuOTYgMjU1LjQ3IDEzMC45NiAyNjUuMDMgMTEzLjMgMjMwLjc0IDExMy4zIDI2OS40NyA0MC45OCAyMDkuODkgNDAuOTgiLz4KPC9zdmc+",
    black:      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+LmNscy0xIHsgZmlsbDogIzFBMUEyRTsgfTwvc3R5bGU+CiAgPC9kZWZzPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMDAuNDQgNTMuODUgMTAwLjQzIDUzLjg1IDEwMC40NCA1My44NiAxMDAuNDQgNTMuODUiLz4KICA8cG9seWdvbiBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMCA5NC43NCA4Mi44MSAxNzcuMjcgODIuODEgMTU5LjY4IDAgNzcuMTMgMCA5NC43NCIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEyNi40LDc5LjcxaDBzLTEyLjk0LTEyLjk0LTEyLjk0LTEyLjk0aC0xNy43cy0xMi45Ni0xMi45Mi0xMi45Ni0xMi45MmgxNy42MmwtMTIuODItMTIuOS0xNy43Ni4wM0wzNS4yOSw2LjYyYy0yLjczLDEuMTQtOC45Niw1LjE4LTEwLjc2LDYuNzdsMzIuMzYsMzIuMjd2NzAuNDdsMjUuOTEsMjUuODJ2LTE3LjYybC0xMi45Ny0xMi45MnYtNTcuNTdoMTIuOTd2NTkuMThoMTIuOTZ2LTQ2LjI2bDEyLjkzLDEyLjkzdjMzLjMzaDEyLjk2czAtMjAuNDQsMC0yMC40NGwtMTIuOTYtMTIuODloMTcuNzFaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNOTAuNDEsMjAuNDhjMC0xMS4zMi05LjE5LTIwLjQ4LTIwLjU1LTIwLjQ4djQwLjk3YzExLjM1LDAsMjAuNTUtOS4xNywyMC41NS0yMC40OFoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00My45NSwxMDMuMjd2LTUyLjk0UzE1LjQ3LDIxLjk0LDE1LjQ3LDIxLjk0Yy0yLjY2LDMuMDEtNS40NSw3LjA5LTcuMywxMC4zNGwyMi44MywyMi43OHYxNy43TDIuODEsNDQuNjZDMS4yNyw1MCwuMzgsNTQuMzkuMTEsNTkuNTdsNDMuODMsNDMuN2guMDFaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzk0LjE4LDg2LjI4YzEzLjEzLTMuMiwxNS45NS0xNC41NiwxNS45NS0yMC45LDAtOC42NS0zLjg4LTE2LjMyLTEwLjI3LTIwLjEtNS0zLjExLTExLjc5LTQuMzItMjMuNTktNC4zMmguMDFzLTMxLjYzLDAtMzEuNjMsMHY4OS45OWgzNy44OGM5LjQzLDAsMTQuOTgtMS4yNSwxOS41Ni00LjIyLDUuOTctMy45MSw5LjQzLTExLjMyLDkuNDMtMTkuNjgsMC02LjYxLTIuMDctMTEuODctNi4yNS0xNS42NS0yLjkxLTIuNy01LjQyLTMuOTItMTEuMS01LjEzWk0zNjcuMTQsNTcuMjhoNS4yNmMxMC41MywwLDE0Ljg0LDIuOTcsMTQuODQsMTAuMzlzLTQuMywxMC41MS0xNC41NiwxMC41MWgtNS41NHYtMjAuOVpNMzc1LjMxLDExNS4yOGgtOC4xOXMuMDEtMjEuMTguMDEtMjEuMThoNS4xMmM2LjgsMCw5LjAzLjI2LDExLjUyLDEuNjEsMy4zMywxLjc2LDUsNC44NSw1LDkuMTcsMCw3LjI4LTQuMDMsMTAuMzktMTMuNDYsMTAuMzlaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQzLjEzLDQwLjk4aC0yNy41NGwtMjguMzIsODYuOC0xOS45LTMzLjY3aC0uMDFjMTMuNTgtNC4yMiwxOS41MS0xNC4yNiwxOS41MS0yNS43MywwLTI0LjQzLTIyLjEyLTI3LjQtMzQuMzItMjcuNGgtMzIuMTJ2ODkuOTloMjIuNDl2LTM3LjMybDIwLjI2LDM3LjMyaDQ1Ljg2bDUuNDctMTcuNzFoMjguODFsNS40NywxNy43MWgyMy41MmwtMjkuMTgtODkuOTlaTTQ0OS43NSw3OS45OGgtNi44NnYtMjIuNjloNi42MWM5LjUzLDAsMTUuMzgsMi4yNiwxNS4zOCwxMC45MywwLDEwLjUtNS44NSwxMS43Ni0xNS4xMywxMS43NlpNNTE5Ljk3LDk1LjQybDguOTQtMjguNjksOC45MywyOC42OWgtMTcuODdaIi8+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjI3Ny4zNCAxMzAuOTYgMzMzLjY1IDEzMC45NiAzMzMuNjUgMTEzLjI5IDI5OS4wNCAxMTMuMjkgMjk5LjA0IDk0LjcxIDMyOC4zOCA5NC43MSAzMjguMzggNzcuMDUgMjk5LjA0IDc3LjA1IDI5OS4wNCA1OC42NSAzMzMuNjUgNTguNjUgMzMzLjY1IDQwLjk4IDI3Ny4zNCA0MC45OCAyNzcuMzQgMTMwLjk2Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTM0LjYsOTguOGwtLjA2LDE0LjIyaC0xMi44OWMwLDExLjMyLDkuMTksMjAuNDgsMjAuNTUsMjAuNDhzMjAuNTUtOS4xNywyMC41NS0yMC40OGgwdi0uMDNsLTE0LjI1LTE0LjJoLTEzLjg5WiIvPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIyMDkuODkgNDAuOTggMjAwLjM0IDU4LjY1IDIzNC42MyA1OC42NSAxOTUuODkgMTMwLjk2IDI1NS40NyAxMzAuOTYgMjY1LjAzIDExMy4zIDIzMC43NCAxMTMuMyAyNjkuNDcgNDAuOTggMjA5Ljg5IDQwLjk4Ii8+Cjwvc3ZnPg==",
    color:      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+LmNscy0xIHsgZmlsbDogIzFBMUEyRTsgfTwvc3R5bGU+CiAgPC9kZWZzPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMDAuNDQgNTMuODUgMTAwLjQzIDUzLjg1IDEwMC40NCA1My44NiAxMDAuNDQgNTMuODUiLz4KICA8cG9seWdvbiBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMCA5NC43NCA4Mi44MSAxNzcuMjcgODIuODEgMTU5LjY4IDAgNzcuMTMgMCA5NC43NCIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTEyNi40LDc5LjcxaDBzLTEyLjk0LTEyLjk0LTEyLjk0LTEyLjk0aC0xNy43cy0xMi45Ni0xMi45Mi0xMi45Ni0xMi45MmgxNy42MmwtMTIuODItMTIuOS0xNy43Ni4wM0wzNS4yOSw2LjYyYy0yLjczLDEuMTQtOC45Niw1LjE4LTEwLjc2LDYuNzdsMzIuMzYsMzIuMjd2NzAuNDdsMjUuOTEsMjUuODJ2LTE3LjYybC0xMi45Ny0xMi45MnYtNTcuNTdoMTIuOTd2NTkuMThoMTIuOTZ2LTQ2LjI2bDEyLjkzLDEyLjkzdjMzLjMzaDEyLjk2czAtMjAuNDQsMC0yMC40NGwtMTIuOTYtMTIuODloMTcuNzFaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNOTAuNDEsMjAuNDhjMC0xMS4zMi05LjE5LTIwLjQ4LTIwLjU1LTIwLjQ4djQwLjk3YzExLjM1LDAsMjAuNTUtOS4xNywyMC41NS0yMC40OFoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik00My45NSwxMDMuMjd2LTUyLjk0UzE1LjQ3LDIxLjk0LDE1LjQ3LDIxLjk0Yy0yLjY2LDMuMDEtNS40NSw3LjA5LTcuMywxMC4zNGwyMi44MywyMi43OHYxNy43TDIuODEsNDQuNjZDMS4yNyw1MCwuMzgsNTQuMzkuMTEsNTkuNTdsNDMuODMsNDMuN2guMDFaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzk0LjE4LDg2LjI4YzEzLjEzLTMuMiwxNS45NS0xNC41NiwxNS45NS0yMC45LDAtOC42NS0zLjg4LTE2LjMyLTEwLjI3LTIwLjEtNS0zLjExLTExLjc5LTQuMzItMjMuNTktNC4zMmguMDFzLTMxLjYzLDAtMzEuNjMsMHY4OS45OWgzNy44OGM5LjQzLDAsMTQuOTgtMS4yNSwxOS41Ni00LjIyLDUuOTctMy45MSw5LjQzLTExLjMyLDkuNDMtMTkuNjgsMC02LjYxLTIuMDctMTEuODctNi4yNS0xNS42NS0yLjkxLTIuNy01LjQyLTMuOTItMTEuMS01LjEzWk0zNjcuMTQsNTcuMjhoNS4yNmMxMC41MywwLDE0Ljg0LDIuOTcsMTQuODQsMTAuMzlzLTQuMywxMC41MS0xNC41NiwxMC41MWgtNS41NHYtMjAuOVpNMzc1LjMxLDExNS4yOGgtOC4xOXMuMDEtMjEuMTguMDEtMjEuMThoNS4xMmM2LjgsMCw5LjAzLjI2LDExLjUyLDEuNjEsMy4zMywxLjc2LDUsNC44NSw1LDkuMTcsMCw3LjI4LTQuMDMsMTAuMzktMTMuNDYsMTAuMzlaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQzLjEzLDQwLjk4aC0yNy41NGwtMjguMzIsODYuOC0xOS45LTMzLjY3aC0uMDFjMTMuNTgtNC4yMiwxOS41MS0xNC4yNiwxOS41MS0yNS43MywwLTI0LjQzLTIyLjEyLTI3LjQtMzQuMzItMjcuNGgtMzIuMTJ2ODkuOTloMjIuNDl2LTM3LjMybDIwLjI2LDM3LjMyaDQ1Ljg2bDUuNDctMTcuNzFoMjguODFsNS40NywxNy43MWgyMy41MmwtMjkuMTgtODkuOTlaTTQ0OS43NSw3OS45OGgtNi44NnYtMjIuNjloNi42MWM5LjUzLDAsMTUuMzgsMi4yNiwxNS4zOCwxMC45MywwLDEwLjUtNS44NSwxMS43Ni0xNS4xMywxMS43NlpNNTE5Ljk3LDk1LjQybDguOTQtMjguNjksOC45MywyOC42OWgtMTcuODdaIi8+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjI3Ny4zNCAxMzAuOTYgMzMzLjY1IDEzMC45NiAzMzMuNjUgMTEzLjI5IDI5OS4wNCAxMTMuMjkgMjk5LjA0IDk0LjcxIDMyOC4zOCA5NC43MSAzMjguMzggNzcuMDUgMjk5LjA0IDc3LjA1IDI5OS4wNCA1OC42NSAzMzMuNjUgNTguNjUgMzMzLjY1IDQwLjk4IDI3Ny4zNCA0MC45OCAyNzcuMzQgMTMwLjk2Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTM0LjYsOTguOGwtLjA2LDE0LjIyaC0xMi44OWMwLDExLjMyLDkuMTksMjAuNDgsMjAuNTUsMjAuNDhzMjAuNTUtOS4xNywyMC41NS0yMC40OGgwdi0uMDNsLTE0LjI1LTE0LjJoLTEzLjg5WiIvPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIyMDkuODkgNDAuOTggMjAwLjM0IDU4LjY1IDIzNC42MyA1OC42NSAxOTUuODkgMTMwLjk2IDI1NS40NyAxMzAuOTYgMjY1LjAzIDExMy4zIDIzMC43NCAxMTMuMyAyNjkuNDcgNDAuOTggMjA5Ljg5IDQwLjk4Ii8+Cjwvc3ZnPg==",
    pdf:        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iSG9yaXpvbnRhbF9Mb2dvIiBkYXRhLW5hbWU9Ikhvcml6b250YWwgTG9nbyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTcyLjMxIDE3Ny4yNyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjEwMC40NCA1My44NSAxMDAuNDMgNTMuODUgMTAwLjQ0IDUzLjg2IDEwMC40NCA1My44NSIvPgogIDxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIwIDk0Ljc0IDgyLjgxIDE3Ny4yNyA4Mi44MSAxNTkuNjggMCA3Ny4xMyAwIDk0Ljc0Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTI2LjQsNzkuNzFoMHMtMTIuOTQtMTIuOTQtMTIuOTQtMTIuOTRoLTE3LjdzLTEyLjk2LTEyLjkyLTEyLjk2LTEyLjkyaDE3LjYybC0xMi44Mi0xMi45LTE3Ljc2LjAzTDM1LjI5LDYuNjJjLTIuNzMsMS4xNC04Ljk2LDUuMTgtMTAuNzYsNi43N2wzMi4zNiwzMi4yN3Y3MC40N2wyNS45MSwyNS44MnYtMTcuNjJsLTEyLjk3LTEyLjkydi01Ny41N2gxMi45N3Y1OS4xOGgxMi45NnYtNDYuMjZsMTIuOTMsMTIuOTN2MzMuMzNoMTIuOTZzMC0yMC40NCwwLTIwLjQ0bC0xMi45Ni0xMi44OWgxNy43MVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik05MC40MSwyMC40OGMwLTExLjMyLTkuMTktMjAuNDgtMjAuNTUtMjAuNDh2NDAuOTdjMTEuMzUsMCwyMC41NS05LjE3LDIwLjU1LTIwLjQ4WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQzLjk1LDEwMy4yN3YtNTIuOTRTMTUuNDcsMjEuOTQsMTUuNDcsMjEuOTRjLTIuNjYsMy4wMS01LjQ1LDcuMDktNy4zLDEwLjM0bDIyLjgzLDIyLjc4djE3LjdMMi44MSw0NC42NkMxLjI3LDUwLC4zOCw1NC4zOS4xMSw1OS41N2w0My44Myw0My43aC4wMVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zOTQuMTgsODYuMjhjMTMuMTMtMy4yLDE1Ljk1LTE0LjU2LDE1Ljk1LTIwLjksMC04LjY1LTMuODgtMTYuMzItMTAuMjctMjAuMS01LTMuMTEtMTEuNzktNC4zMi0yMy41OS00LjMyaC4wMXMtMzEuNjMsMC0zMS42Mywwdjg5Ljk5aDM3Ljg4YzkuNDMsMCwxNC45OC0xLjI1LDE5LjU2LTQuMjIsNS45Ny0zLjkxLDkuNDMtMTEuMzIsOS40My0xOS42OCwwLTYuNjEtMi4wNy0xMS44Ny02LjI1LTE1LjY1LTIuOTEtMi43LTUuNDItMy45Mi0xMS4xLTUuMTNaTTM2Ny4xNCw1Ny4yOGg1LjI2YzEwLjUzLDAsMTQuODQsMi45NywxNC44NCwxMC4zOXMtNC4zLDEwLjUxLTE0LjU2LDEwLjUxaC01LjU0di0yMC45Wk0zNzUuMzEsMTE1LjI4aC04LjE5cy4wMS0yMS4xOC4wMS0yMS4xOGg1LjEyYzYuOCwwLDkuMDMuMjYsMTEuNTIsMS42MSwzLjMzLDEuNzYsNSw0Ljg1LDUsOS4xNywwLDcuMjgtNC4wMywxMC4zOS0xMy40NiwxMC4zOVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik01NDMuMTMsNDAuOThoLTI3LjU0bC0yOC4zMiw4Ni44LTE5LjktMzMuNjdoLS4wMWMxMy41OC00LjIyLDE5LjUxLTE0LjI2LDE5LjUxLTI1LjczLDAtMjQuNDMtMjIuMTItMjcuNC0zNC4zMi0yNy40aC0zMi4xMnY4OS45OWgyMi40OXYtMzcuMzJsMjAuMjYsMzcuMzJoNDUuODZsNS40Ny0xNy43MWgyOC44MWw1LjQ3LDE3LjcxaDIzLjUybC0yOS4xOC04OS45OVpNNDQ5Ljc1LDc5Ljk4aC02Ljg2di0yMi42OWg2LjYxYzkuNTMsMCwxNS4zOCwyLjI2LDE1LjM4LDEwLjkzLDAsMTAuNS01Ljg1LDExLjc2LTE1LjEzLDExLjc2Wk01MTkuOTcsOTUuNDJsOC45NC0yOC42OSw4LjkzLDI4LjY5aC0xNy44N1oiLz4KICA8cG9seWdvbiBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMjc3LjM0IDEzMC45NiAzMzMuNjUgMTMwLjk2IDMzMy42NSAxMTMuMjkgMjk5LjA0IDExMy4yOSAyOTkuMDQgOTQuNzEgMzI4LjM4IDk0LjcxIDMyOC4zOCA3Ny4wNSAyOTkuMDQgNzcuMDUgMjk5LjA0IDU4LjY1IDMzMy42NSA1OC42NSAzMzMuNjUgNDAuOTggMjc3LjM0IDQwLjk4IDI3Ny4zNCAxMzAuOTYiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xMzQuNiw5OC44bC0uMDYsMTQuMjJoLTEyLjg5YzAsMTEuMzIsOS4xOSwyMC40OCwyMC41NSwyMC40OHMyMC41NS05LjE3LDIwLjU1LTIwLjQ4aDB2LS4wM2wtMTQuMjUtMTQuMmgtMTMuODlaIi8+CiAgPHBvbHlnb24gY2xhc3M9ImNscy0xIiBwb2ludHM9IjIwOS44OSA0MC45OCAyMDAuMzQgNTguNjUgMjM0LjYzIDU4LjY1IDE5NS44OSAxMzAuOTYgMjU1LjQ3IDEzMC45NiAyNjUuMDMgMTEzLjMgMjMwLjc0IDExMy4zIDI2OS40NyA0MC45OCAyMDkuODkgNDAuOTgiLz4KPC9zdmc+",
    navHeight:  "28px",
    heroHeight: "36px",
  },

  // ── PPTX ──────────────────────────────────────────────────
  pptx: {
    slideWidth:  13.3,
    slideHeight: 7.5,
  },

  // ── CO-BRAND ──────────────────────────────────────────────
  partner: { name: null, logoUrl: null, logoHeight: "22px" },
};

// ── BRAND APPLY FUNCTIONS ─────────────────────────────────
// Call applyBrand() once real assets are dropped in
function applyBrand() {
  const c = BRAND.colors;
  const root = document.documentElement.style;
  root.setProperty('--brand-primary', c.primary);
  root.setProperty('--brand-dark',    c.dark);
  root.setProperty('--brand-accent',  c.accent);
  root.setProperty('--blue',          c.primary);
  root.setProperty('--navy',          c.dark);
  root.setProperty('--bright',        c.accent);
  root.setProperty('--bg',            c.light);
  root.setProperty('--text',          c.text);
  root.setProperty('--gold',          c.kpi);
  root.setProperty('--head',          `'${BRAND.fonts.heading}', sans-serif`);
  root.setProperty('--body',          `'${BRAND.fonts.body}', sans-serif`);

  // Logo swap — fault-tolerant: falls back to text if asset missing
  const slot = document.getElementById('brand-logo-slot');
  if(slot && BRAND.logos.white) {
    const navImg = new Image();
    navImg.onload = () => { slot.outerHTML = `<img src="${BRAND.logos.white}" alt="${BRAND.company}" style="height:${BRAND.logos.navHeight};width:auto;display:block">`; };
    navImg.onerror = () => { console.warn('[BRAND] Nav logo not found:', BRAND.logos.white, '— using fallback SVG'); };
    navImg.src = BRAND.logos.white;
  }

  // Exec hero logo
  const heroSlot = document.getElementById('exec-logo-slot');
  if(heroSlot && BRAND.logos.white) {
    const heroImg = new Image();
    heroImg.onload = () => { heroSlot.outerHTML = `<img src="${BRAND.logos.white}" alt="${BRAND.company}" style="height:${BRAND.logos.heroHeight};width:auto;display:block">`; };
    heroImg.onerror = () => { console.warn('[BRAND] Hero logo not found:', BRAND.logos.white, '— using fallback'); };
    heroImg.src = BRAND.logos.white;
  }

  // Favicon
  if(BRAND.logos.favicon) {
    const link = document.createElement('link');
    link.rel = 'icon'; link.href = BRAND.logos.favicon;
    document.head.appendChild(link);
  }
}

function applyPartnerBrand(name, logoUrl) {
  BRAND.partner.name = name;
  BRAND.partner.logoUrl = logoUrl;
  // Update co-brand slot in exec hero if present
  const slot = document.getElementById('partner-logo-slot');
  if(slot && logoUrl) {
    slot.innerHTML = `<img src="${logoUrl}" alt="${name}" style="height:${BRAND.partner.logoHeight};width:auto;opacity:.85">`;
    slot.style.display = 'flex';
  }
}

// ── AUTO-APPLY: uncomment when real assets are in place ──
document.addEventListener('DOMContentLoaded', applyBrand);

// ── RAMP (50% Y1 / 85% Y2 / 100% Y3 as conservative standard) ──
const RAMP = {
  hard_labor:  { y1:.50, y2:.85, y3:1.00, label:"Hard Labor",  cls:"bf-hl" },
  hard_cost:   { y1:.50, y2:.85, y3:1.00, label:"Hard Cost",   cls:"bf-hc" },
  revenue:     { y1:.30, y2:.70, y3:1.00, label:"Revenue",     cls:"bf-rv" },
  soft:        { y1:.25, y2:.65, y3:1.00, label:"Soft Prod.",  cls:"bf-sf" },
  working_cap: { y1:.20, y2:.60, y3:1.00, label:"Working Cap.",cls:"bf-wc" },
  strategic:   { y1:.00, y2:.20, y3:.60,  label:"Strategic",   cls:"bf-sf" },
};

// ── SCENARIOS ──
