# A forradalom öröksége: győztes utak

Minden fókuszúthoz egy válaszsor, amellyel mind a 4 fókusz teljesül, és létrejön a kormány. A `winningPaths.test.ts` ezeket játssza végig. Hangolás után: `UPDATE_WINNING_PATHS=1 yarn test winningPaths`.

## MSZMP: Nagy Imre

1. A győzelem terhe · 2. A fegyverek sorsa · 3. Két hang a Corvin közből · 4. Az utolsó szerelvények · 5. A bíboros szava · 6. Hideg tél · 7. A régi apparátus · 8. Kádár ultimátuma · 9. Kéthly feltételei · 10. Szabad szakszervezetek · 11. A múlt felelősei · 12. Az egyetemisták · 13. Föld és beszolgáltatás · 14. Kié a gyár? · 15. Ellenfél, nem ellenség · 16. Bibó alkotmánya · 17. Kik szavazhatnak? · 18. Szén vagy dollár · 19. A rádió szabadsága · 20. Listakapcsolás · 21. Falujárás · 22. Szószék és urna · 23. Lövések a Köztársaság téren · 24. Az osztrák út · 25. Záró nagygyűlés

| Út                                                                            | Partner                      | Válaszok                        |
| ----------------------------------------------------------------------------- | ---------------------------- | ------------------------------- |
| Lassú reformok → Baloldali szövetség → Semleges híd → Baloldali kormány       | Kéthly Anna                  | `AABDD DBBAD ADABC BACCA AABBC` |
| Lassú reformok → Baloldali szövetség → Semleges híd → Konszolidáció           | Kéthly Anna                  | `AABDD DBBAD ADAAC BACCA AABBC` |
| Lassú reformok → Baloldali szövetség → Nyitás Nyugat felé → Baloldali kormány | Kéthly Anna                  | `AABDD DBBAD AAAAC BAACA AABAC` |
| Lassú reformok → Baloldali szövetség → Nyitás Nyugat felé → Konszolidáció     | Kéthly Anna                  | `AABDD ABBAD ADAAC BAACA AABAC` |
| Lassú reformok → Egy zászló alatt → Semleges híd → Önálló legitimitás         | önálló többség               | `AABDD DBBBC ADAAC BACCC AABBC` |
| Lassú reformok → Egy zászló alatt → Semleges híd → Bibó útja                  | Bibó István vagy Kéthly Anna | `AABDD DBBBC ADAAC CACCB AABBC` |
| Lassú reformok → Egy zászló alatt → Nyitás Nyugat felé → Bibó útja            | Bibó István vagy Kéthly Anna | `ACBAD CCBDC DCAAC CABDB DDABC` |
| Lassú reformok → Egy zászló alatt → Nyitás Nyugat felé → Önálló legitimitás   | önálló többség               | `ADAAD DBBBC ADAAC BACCC AABAC` |

1. A győzelem terhe · 2. A fegyverek sorsa · 3. Két hang a Corvin közből · 4. Az utolsó szerelvények · 5. A bíboros szava · 6. Hideg tél · 7. A régi apparátus · 8. Kádár ultimátuma · 9. Kéthly feltételei · 10. Szabad szakszervezetek · 11. Két munkáspárt · 12. Az egyetemisták · 13. Föld és beszolgáltatás · 14. Kié a gyár? · 15. Ellenfél, nem ellenség · 16. Bibó alkotmánya · 17. Kik szavazhatnak? · 18. Szén vagy dollár · 19. A rádió szabadsága · 20. Listakapcsolás · 21. Falujárás · 22. Szószék és urna · 23. Lövések a Köztársaság téren · 24. Az osztrák út · 25. Záró nagygyűlés

| Út                                                                                 | Partner     | Válaszok                        |
| ---------------------------------------------------------------------------------- | ----------- | ------------------------------- |
| A forradalom pártja → Baloldali szövetség → Semleges híd → Baloldali kormány       | Kéthly Anna | `AABDD DBCAD BDAAC BACBA AABBC` |
| A forradalom pártja → Baloldali szövetség → Semleges híd → Konszolidáció           | Kéthly Anna | `AABDD DBCAD CDAAC BACCA AABBC` |
| A forradalom pártja → Baloldali szövetség → Nyitás Nyugat felé → Baloldali kormány | Kéthly Anna | `AABAD DBCAD BDAAC BACCD AABAC` |
| A forradalom pártja → Baloldali szövetség → Nyitás Nyugat felé → Konszolidáció     | Kéthly Anna | `AABAD DBCAD CDAAC BACCA AABAC` |

## Független Kisgazdapárt: Kovács Béla

1. Az áldozatok pártja · 2. Kik jöhetnek be? · 3. Senki ne álmodozzon · 4. Templom földje, paraszt földje · 5. Hideg tél a kormányban · 6. Dobi emberei · 7. Kuláklisták · 8. Vége a beszolgáltatásnak? · 9. Levél Amerikából · 10. Ajtócsapás vagy kézfogás · 11. Az orvosok intelme · 12. A kitelepítettek lakásai · 13. Kie legyen a gyár? · 14. A tsz és a gépállomás · 15. A svábok · 16. Közös lista · 17. Nagy Ferenc megérkezik · 18. Sulyok ajánlata · 19. Horthy árnyéka · 20. Papír a Kis Újságnak · 21. Nagy Imréről · 22. Három párt, egy program? · 23. Egyszer már elvesztettétek · 24. Záró nagygyűlés

| Út                                                                 | Partner                          | Válaszok                       |
| ------------------------------------------------------------------ | -------------------------------- | ------------------------------ |
| A 45-ös párt → Saját zászló → Polgári blokk → Elégtétel 1947-ért   | Bibó István + Barankovics István | `BACAA BBABC BBCAA ABBAB ABAB` |
| A 45-ös párt → Saját zászló → Polgári blokk → Nem bosszút állunk   | Bibó István + Barankovics István | `ADCAA BBABC BBCAA ABBAB ABAB` |
| A 45-ös párt → Saját zászló → A falu pártja → Elégtétel 1947-ért   | Bibó István + Barankovics István | `ADCAA BBABC CBCAA DBBAB ACAB` |
| A 45-ös párt → Saját zászló → A falu pártja → Nem bosszút állunk   | Bibó István + Barankovics István | `ADCAA BBABC CBCAA DBBAB ACAB` |
| Nincs visszaút → Saját zászló → Polgári blokk → Elégtétel 1947-ért | Bibó István + Barankovics István | `BACAA BBABC BBCAA ABBAB ABAB` |
| Nincs visszaút → Saját zászló → Polgári blokk → Nem bosszút állunk | Bibó István + Barankovics István | `ABCAA BBABC BBCAA ABBAB AAAB` |
| Nincs visszaút → Saját zászló → A falu pártja → Elégtétel 1947-ért | Bibó István + Barankovics István | `ADCAA BBABC CBCAA DBBAB ACAB` |
| Nincs visszaút → Saját zászló → A falu pártja → Nem bosszút állunk | Bibó István + Barankovics István | `ADCAA BBABC CBCAA DBBAB ACAB` |

1. Az áldozatok pártja · 2. Kik jöhetnek be? · 3. Senki ne álmodozzon · 4. Templom földje, paraszt földje · 5. Hideg tél a kormányban · 6. Dobi emberei · 7. Kuláklisták · 8. Vége a beszolgáltatásnak? · 9. Levél Amerikából · 10. A bent maradás ára · 11. Az orvosok intelme · 12. A kitelepítettek lakásai · 13. Kie legyen a gyár? · 14. A tsz és a gépállomás · 15. A svábok · 16. Közös lista · 17. Nagy Ferenc megérkezik · 18. Sulyok ajánlata · 19. Moszkva üzenete · 20. Papír a Kis Újságnak · 21. Kormánytársként · 22. Három párt, egy program? · 23. Egyszer már elvesztettétek · 24. Záró nagygyűlés

| Út                                                                  | Partner                          | Válaszok                       |
| ------------------------------------------------------------------- | -------------------------------- | ------------------------------ |
| A 45-ös párt → Bent maradunk → Polgári blokk → Elégtétel 1947-ért   | Bibó István + Barankovics István | `BACAA BBABB CBCAA ABBCB BBAB` |
| A 45-ös párt → Bent maradunk → Polgári blokk → Nem bosszút állunk   | Bibó István + Barankovics István | `ADCAA BBABB CBCAA ABBCB BBAB` |
| A 45-ös párt → Bent maradunk → A falu pártja → Elégtétel 1947-ért   | Bibó István + Barankovics István | `BACAA BBABB CBCAA DBBCB BCAB` |
| A 45-ös párt → Bent maradunk → A falu pártja → Nem bosszút állunk   | Bibó István + Barankovics István | `ADCCA BBABB CBCAA DBBCB BCAB` |
| Nincs visszaút → Bent maradunk → Polgári blokk → Elégtétel 1947-ért | Bibó István + Barankovics István | `BACAA BBABB CBCAA ABBCB BBAB` |
| Nincs visszaút → Bent maradunk → Polgári blokk → Nem bosszút állunk | Bibó István + Barankovics István | `ABCAA BBABB CBCAA ABBCB BAAB` |
| Nincs visszaút → Bent maradunk → A falu pártja → Elégtétel 1947-ért | Bibó István + Barankovics István | `BACAA BBABB CBCAA DBBCB BCAB` |
| Nincs visszaút → Bent maradunk → A falu pártja → Nem bosszút állunk | Bibó István + Barankovics István | `ADCCA BBABB CBCAA DBBCB BCAB` |

## Szociáldemokrata Párt: Kéthly Anna

1. Hazatérés Bécsből · 2. Ki volt a bírád? · 3. Kié a Népszava? · 4. A győzelem terhe · 5. Hideg tél · 6. Asszony a kormány élén? · 7. A szabad szakszervezet · 8. Lakás, nyugdíj, bölcsőde · 9. Csepel tanácsa · 10. Kié a gyár? · 11. Szén vagy dollár · 12. Kádár lapjai · 13. Nagy Imre ajánlata · 14. Bibó alkotmánya · 15. Marosán az ajtóban · 16. Gyár és falu · 17. Két munkáspárt · 18. Kik szavazhatnak? · 19. Az angolok embere · 20. Az osztrák út · 21. Rádióvita Nagy Imrével · 22. Listakapcsolás · 23. Asszonyok a Kossuth téren · 24. Záró nagygyűlés

| Út                                                                                 | Partner                    | Válaszok                       |
| ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------ |
| A magyar Jeanne d'Arc → Jóléti állam → Harmadik erő → Az első asszony              | Bibó István                | `BAADB CBCAC BDDBA BDBCA ACAB` |
| A magyar Jeanne d'Arc → Jóléti állam → Harmadik erő → A stabilitás pártja          | Bibó István                | `BAADA CBCAC BDDBA BDBCA AAAA` |
| A magyar Jeanne d'Arc → Jóléti állam → Az igazi baloldal → Az első asszony         | Nagy Imre vagy Bibó István | `BAADA CBCAC BDABA ACBCA DCAB` |
| A magyar Jeanne d'Arc → Jóléti állam → Az igazi baloldal → A stabilitás pártja     | Nagy Imre                  | `BAADA CBCAC BDBBA BDBCA DAAA` |
| A magyar Jeanne d'Arc → A gyár a munkásé → Harmadik erő → Az első asszony          | Bibó István                | `BAADB CBDAB BDDBA ADDCA ACAA` |
| A magyar Jeanne d'Arc → A gyár a munkásé → Harmadik erő → A stabilitás pártja      | Bibó István                | `BAADB CBDAB BDDBA ADDCA AAAA` |
| A magyar Jeanne d'Arc → A gyár a munkásé → Az igazi baloldal → Az első asszony     | Nagy Imre vagy Bibó István | `BAADB CBDAB BDBBA ADACA ACAB` |
| A magyar Jeanne d'Arc → A gyár a munkásé → Az igazi baloldal → A stabilitás pártja | Nagy Imre vagy Bibó István | `BAADB CBDAB BDBBA ACACA AAAA` |
| A párt az erő → Jóléti állam → Harmadik erő → Az első asszony                      | Bibó István                | `BAADA CBBAC BDDBB BABCA ACAA` |
| A párt az erő → Jóléti állam → Harmadik erő → A stabilitás pártja                  | Bibó István                | `BAADA CBBAC BDDBB BABCA AAAA` |
| A párt az erő → Jóléti állam → Az igazi baloldal → Az első asszony                 | Nagy Imre vagy Bibó István | `BAADA CBBAC BDABB ACBCA ACAA` |
| A párt az erő → Jóléti állam → Az igazi baloldal → A stabilitás pártja             | Nagy Imre vagy Bibó István | `BAADA CBBAC BDABB ACBCA AAAA` |
| A párt az erő → A gyár a munkásé → Harmadik erő → Az első asszony                  | Bibó István                | `BAADB CBDAB BDDBA AADCA ACAB` |
| A párt az erő → A gyár a munkásé → Harmadik erő → A stabilitás pártja              | Bibó István                | `BAADB CBDAB BDDBA AADCA AAAA` |
| A párt az erő → A gyár a munkásé → Az igazi baloldal → Az első asszony             | Nagy Imre vagy Bibó István | `BAADB CBDAB BDBBA ADDCA ACAB` |
| A párt az erő → A gyár a munkásé → Az igazi baloldal → A stabilitás pártja         | Nagy Imre vagy Bibó István | `BAADB CBDAB BDBBA ACDCA AAAA` |
