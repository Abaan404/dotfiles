import QtQuick
import QtQuick.Layouts
import QtQuick.Controls.impl 2.15

import Colors

PageButton {
    id: root

    default property alias children3: column.children

    property string source;
    property string text;

    rectSideMargin: 14
    rectMargin: 12

    ColumnLayout {
        id: column

        spacing: 10

        RowLayout {
            spacing: 18

            ColorImage {
                sourceSize {
                    width: 26
                    height: 26
                }

                source: root.source
                color: Colors.text
            }

            Text {
                Layout.fillWidth: true

                text: root.text
                color: Colors.text
                elide: Text.ElideRight

                font {
                    pixelSize: 20
                    weight: Font.Bold
                }
            }
        }
    }
}
