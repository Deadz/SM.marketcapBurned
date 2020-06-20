$.ajax(
{
	url: 'https://game-api.splinterlands.com/market/for_sale_grouped/',
	dataType: 'json',
	type : 'GET',
	success: function(datas)
	{
		prices = datas;
		getCardInfo();
	}
});

function getCardInfo()
{
	cardList = [];
	let total = 0;
	let totalBCX = 0;
	$.ajax(
	{
		url: 'https://game-api.splinterlands.com/cards/get_details/',
		dataType: 'json',
		type : 'GET',
		success: function(d)
		{
			i = 0;
			d.forEach(function(card)
			{
				let b = 0;
				let m = 0;
				let s = 0;
				
				cardList[i] = {id: card.id, name: card.name, type: card.type, bcx: "", marketcap: "", supply: "", dist: []};
				card["distribution"].forEach(function(dist)
				{					
					info = prices.find(p => p.card_detail_id === dist.card_detail_id && p.gold === dist.gold && p.edition === dist.edition);

					if(typeof(info) !== "undefined")
					{
						switch(dist.edition)
						{
							case 0:
								edition = "Alpha";
								break;
							case 1:
								edition = "Beta";
								break;
							case 2:
								edition = "Promo";
								break;
							case 3:
								edition = "Reward";
								break;
							default:
								edition = "Untamed";
						}
						if(card.tier == 4)
						{
							dist.edition = 4;
						}
						bcx = xptoBCX(dist.total_burned_xp, dist.gold, dist.edition, card.rarity, dist.num_burned);
						low_price = (info.low_price_bcx).toFixed(3);
						marketcap = (low_price*bcx).toFixed(0)
						cardList[i].dist.push({edition: edition, gold: dist.gold, rarity: card.rarity, bcx: bcx, supply: dist.num_burned, price: low_price});
	
						b = parseInt(b)+parseInt(bcx);
						m = parseInt(m)+parseInt(marketcap);
						s = parseInt(s)+parseInt(dist.num_burned);
					}
				});
				cardList[i].bcx = b;
				cardList[i].marketcap = m;
				cardList[i].supply = s;
				i++;
				total = total+m;
				totalBCX = b+totalBCX;
				$("#totalM").text("-"+new Intl.NumberFormat().format(total));
				$("#totalBCX").text("-"+new Intl.NumberFormat().format(totalBCX));
			});
			showTabl(cardList);
		}
	});
}

function xptoBCX(totalxp, gold, edition, rarity, supply)
{
	if(edition == 1 || edition == 3 || edition == 2)
	{
		if(!gold)
		{
			if(rarity == 1) xp = 15;
			if(rarity == 2) xp = 75;
			if(rarity == 3) xp = 175;
			if(rarity == 4) xp = 750;

			bcx = Math.floor(totalxp/xp+parseInt(supply));
		}
		else
		{
			if(rarity == 1) xp = 200;
			if(rarity == 2) xp = 400;
			if(rarity == 3) xp = 800;
			if(rarity == 4) xp = 2000;

			bcx = Math.floor(totalxp/xp);
		}
	}
	else if(edition == 0)
	{
		if(!gold)
		{
			if(rarity == 1) xp = 20;
			if(rarity == 2) xp = 100;
			if(rarity == 3) xp = 250;
			if(rarity == 4) xp = 1000;

			bcx = Math.floor(totalxp/xp+parseInt(supply));
		}
		else
		{
			if(rarity == 1) xp = 250;
			if(rarity == 2) xp = 500;
			if(rarity == 3) xp = 1000;
			if(rarity == 4) xp = 2500;
			
			bcx = Math.floor(totalxp/xp);			
		}
	}
	else
	{
		bcx = totalxp;
	}
	return bcx;
}

function showInfo(id)
{
	if($(".id"+id).hasClass("w3-hide"))
	{
		$(".id"+id).removeClass(' w3-hide');
		$("#"+id).html("<i class='far fa-caret-square-up'></i>");
		$(".id"+id).addClass(' w3-light-gray');
	}
	else
	{
		$(".id"+id).addClass(' w3-hide');
		$("#"+id).html("<i class='far fa-caret-square-down'></i>");
		$(".id"+id).removeClass(' w3-light-gray');
	}
}

function showTabl(cardList)
{
	cardList.sort ((a, b) => b.marketcap - a.marketcap); // On trie par marketcap
	let i = 1;
	cardList.forEach(function(card)
	{
		if(card.type == "Summoner")
			img = "https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-summoner.svg";
		else
			img = "https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-monster.svg"

		if(i === 1)
			clas = "w3-xxlarge w3-text-amber w3-blue-grey";
		else if(i ===2)
			clas = "w3-xlarge w3-text-lightgrey w3-blue-grey";
		else if(i===3)
			clas = "w3-large w3-text-brown w3-blue-grey";
		else
			clas = "w3-blue-grey";
		$("#tabl").append("<tr onclick='showInfo("+card.id+")' class='"+clas+"'><td>"+i+"</td><td><img style='width : 30px; height : 30px' class='w3-round w3-black' src='"+img+"'/> "
			+card.name+"</td><td class='w3-text-red'>-"+new Intl.NumberFormat().format(card.marketcap)+" $</td><td>-"+new Intl.NumberFormat().format(card.bcx)+" BCX</td><td>-"+new Intl.NumberFormat().format(card.supply)+"</td><td id='"+card.id+"'><i class='far fa-caret-square-down'></i></td></tr>");
		i++;
		card.dist.forEach(function(info)
		{
			if(info.gold)
				info.edition = "<span class='w3-text-amber'>"+info.edition+"</span>";
			$("#tabl").append("<tr class='id"+card.id+" w3-hide'><td>"
				+info.edition+"</td><td>"
				+new Intl.NumberFormat().format(info.price)+" $/BCX</td><td class='w3-text-red'>-"+new Intl.NumberFormat().format((info.bcx*info.price).toFixed(0))+" $</td><td>-"
				+new Intl.NumberFormat().format(info.bcx)+"</td><td>-"+Intl.NumberFormat().format(info.supply)+"</td><td></td></tr>");
		});
	});

}
