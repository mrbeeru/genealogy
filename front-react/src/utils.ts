export default function measureText(text: string, fontSize: number) {
    // TODO: improve
    return { width: text.length * 8, height: (fontSize * 12) / 16 };
}
