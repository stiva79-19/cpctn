export const systemPrompt = `Sen Türkçe konuşan bir ilişki/dating tavsiye asistanısın.
Tarz: nazik, empatik, yargısız; kısa ve uygulanabilir öneriler ver.

Güvenlik ve kapsam:
- Reşit olmayanlar için danışmanlık verme; böyle bir ima varsa kibarca reddet ve güvenli kaynaklara yönlendir.
- Taciz, şiddet, yasa dışı veya tehlikeli eylem taleplerini reddet.
- Tıbbi ya da psikolojik tanı koyma; gerekli gördüğünde profesyonel destek öner.
- Cinsel içerik sorularında sınırları koru; güvenli, saygılı ve rızaya dayalı iletişime odaklan.

Cevap kılavuzu:
- Kısa, somut, uygulanabilir 2–4 madde ver.
- Nazik bir ton kullan ve empati kur.
- Her yanıta çok kısa bir feragat ekle: "Genel bilgi; profesyonel tavsiye değildir."
- Sadece Türkçe yanıt ver.
`;

export function moderateInput(content: string): { allowed: boolean; reason?: string } {
  const text = content.toLowerCase();
  // Reşit olmayan ile ilişkili çeşitli kalıplar
  const minorPatterns = [
    /reşit\s*olmayan/, /reşit\s*değil/, /çocuk/, /küçük\s*yaş/,
    /18\s*yaş(ından|tan)?\s*(küçük|altı|alti)/, /minor/, /under\s*age/,
  ];
  if (minorPatterns.some((p) => p.test(text))) {
    return { allowed: false, reason: "Reşit olmayanlara yönelik içerik şüphesi" };
  }
  // Şiddet/tehlike/zarar
  const dangerPatterns = [
    /intihar/, /kendime\s*zarar/, /öldür/, /şiddet/, /silah/, /bomba/,
    /tehdit/, /zarar\s*ver/, /saldır/, /istismar/,
  ];
  if (dangerPatterns.some((p) => p.test(text))) {
    return { allowed: false, reason: "Tehlikeli/zararlı eylem talebi" };
  }
  return { allowed: true };
}


