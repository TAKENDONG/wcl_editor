import { useMemo } from 'react';
import type { Locale } from '../../i18n/strings.ts';

// Le pays, choisi dans une liste (10/10/2026) : un code à deux lettres saisi à
// la main (« CM ») n'était pas compris des éditeurs, et une faute de frappe
// donnait un pays qui n'existe pas. Les noms viennent du navigateur, dans la
// langue du portail.
const CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT ' +
  'MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG ' +
  'UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ');

export function CountryField({ label, value, onChange, locale, required }: {
  label: string; value: string; onChange: (code: string) => void; locale: Locale; required?: boolean;
}) {
  const pays = useMemo(() => {
    let noms: Intl.DisplayNames | null = null;
    try { noms = new Intl.DisplayNames([locale], { type: 'region' }); } catch { noms = null; }
    return CODES
      .map((code) => ({ code, nom: noms?.of(code) ?? code }))
      .sort((a, b) => a.nom.localeCompare(b.nom, locale));
  }, [locale]);

  return (
    <label className="field">
      <span>{label}{required ? ' *' : ''}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">—</option>
        {pays.map((p) => <option key={p.code} value={p.code}>{p.nom}</option>)}
      </select>
    </label>
  );
}
