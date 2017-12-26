const revisions = ["1132677","1132678","1132676","1132675","1132674","1132673","1132672","1132671","1132670","1132669","1132668","1132667","1132666","1132665","1132663","1132664","1132662","1132661","1132658","1132659","1132660","1132657","1132656","1132655","1132654","1132653","1132650","1132651","1132652","1132649","1132647","1132648","1132645","1132646","1132643","1132644","1132642","1132641","1132640","1132639","1132637","1132636","1132635","1132634","1132632","1132633","1132630","1132631","1132628","1132629","1132625","1132626","1132627","1132624","1132621","1132620","1132618","1132619","1132617","1132616","1132614","1132615","1132610","1132609","1132608","1132607","1132606","1132605","1132603","1132604","1132602","1132601","1132600","1132599","1132597","1132598","1132596","1132595","1132592","1132593","1132590","1132591","1132589","1132588","1132586","1132587","1132585","1132584","1132583","1132582","1132581","1132580","1132578","1132579","1132576","1132577","1132574","1132575","1132573","1132572","1132571","1132570","1132569","1132568","1132567","1132566","1132563","1132564","1132565","1132562","1132560","1132561","1132559","1132558","1132556","1132557","1132554","1132555","1132553","1132552","1132550","1132551","1132548","1132549","1132546","1132547","1132544","1132545","1132542","1132543","1132541","1132540","1132538","1132539","1132532","1132533","1132534","1132535","1132536","1132537","1132531","1132530"];

export default function (program, wiki) {
  program
    .command("antispam")
    .description("清理版本可见性。")
    .action(async () => {
      try {
        for (let id of revisions) {
          console.log(await wiki.revisiondelete(id));
        }
      } catch(e) {
        console.log(e);
      }
    });
}