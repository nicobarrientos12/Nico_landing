#!/usr/bin/env python3
"""
Genera un codigo QR PNG para un enlace.
"""

from pathlib import Path

import qrcode


URL = "https://nicolasbarrientos.netlify.app/"
OUTPUT = Path("qr_nicolasbarrientos.png")


def main() -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(URL)
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white")
    image.save(OUTPUT)
    print(f"QR generado: {OUTPUT.resolve()}")


if __name__ == "__main__":
    main()
