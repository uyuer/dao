const http = require('http')
const fs=require('fs');
const url=require('url');
const jsdom=require('jsdom');
const {JSDOM} = jsdom;

function getResource(surl,success){
	let urlObj=url.parse(surl);
	let http = urlObj.protocol=='http:'? require('http') : require('https');
	let req = http.request({
		'hostname':urlObj.hostname,
		'path':urlObj.path
	},res=>{
		if(res.statusCode==200){
			let arr=[],str='';
			res.on('data',(data)=>{
				arr.push(data);
				str+=data
			});
			res.on('end',()=>{
				let b=Buffer.concat(arr);
				success && success(b,str);
			})
		}else if(res.statusCode==302 || res.statusCode==301){
			getResource(res.headers.location,success)
		}
	})
	req.end();
	req.on('err',(err)=>{
		console.log(err)
	})
}

getResource('http://www.seputu.com/',(data,str)=>{
	let DOM=new JSDOM(str);
	let document=DOM.window.document;
	let book={
		name:'',
		intro:'',
		chapter:[
			// {
			// 	title:,
			// 	mulus:[
			// 		{
			// 			mulu:,
			// 			href:,
			// 		},
			// 	]
			// },
		]
	}
	let aMulu=document.querySelectorAll('.mulu');
	for(var mulu of aMulu){
		if(mulu.querySelector('h1')){
			book.name=mulu.querySelector('h1').innerHTML;
			book.intro=mulu.querySelector('p').innerHTML.replace(/<[^>]+>/g,'')
		}else{
			let title=mulu.querySelector('h2').innerHTML;
			let alist=mulu.querySelectorAll(".box a");
			let mulus=[];
			for(var list of alist){
				mulus.push({
					mulu:list.innerHTML,
					href:list.getAttribute('href')
				})
			}
			book.chapter.push({
				title:title,
				mulus:mulus
			})
		}
	}
	console.log(book)
	fs.writeFile('daomubiji.json',JSON.stringify(book),()=>{
		console.log('写入json成功')
	})
})