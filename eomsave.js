$.shade(true);
if($.custom.form.subflag == 1){

	$.epm.snackbar('正在保存数据，请稍后！');

}else{

$.custom.form.submit =function(vs){
	var manageOrganizationId=$.custom.getFieldValue("manageOrganizationId");
	var administrativeOrganizationId = $.custom.getFieldValue("administrativeOrganizationId");
	var type=$.custom.getFieldValue("type");

	var isKY = $.custom.getFieldValue("isScientific");

	var hetong = parseFloat(Number($.custom.getFieldValue("contractMoney"))).toFixed(2);
	var caigou = parseFloat(Number($.custom.getFieldValue("purchase"))).toFixed(2);
	var chengbenheji = parseFloat(Number($.custom.getFieldValue("preTotalCost"))).toFixed(2);;

	var passVp = "no";
	if((hetong-caigou-chengbenheji)/hetong <0.3 || (hetong-caigou) > 500){
		passVp = "yes";
	}

	var processInstanceId = $.custom.getFieldValue("processInstanceId");
	if(processInstanceId !=""){
		var modUrl = "/bpm/bpmservice/worktask/setVariables?processInstanceId="+processInstanceId+"&passVp="+passVp+"&isKY="+isKY+"";
		$.ajax({
			url : modUrl,
			type: "GET",
			dataType : "json",
			async: false,
			cache: false,
			success: function(data){
				if(!data.success){
					$.epm.snackbar('流程变量修改失败！','2000',function(){$.shade(false)});
					return;
				}
			}
		});
	}

	var repuestUrl="/process/startProcessByModelKey?modelKey=oms_epm_execute&loginId="+$('#loguser').val()+"&tenant_id="+$('#tenantId').val()+"&autoClaim=true&instanceId="+vs.data+"&manageOrganizationId="+manageOrganizationId+"&type="+type+"&passVp="+passVp+"&isKY="+isKY+"&administrativeOrganizationId="+administrativeOrganizationId;
	var taskId=$.epm.tools.request.getParams().taskId;
	if(taskId==undefined){
		$.ajax({
		  url:"form!work.action",
		  data:{url:repuestUrl},
		  type:"POST",
		  success:function(pIdData){
			var item=$.parseJSON(pIdData.data);
			debugger
			if(item.success){
				var entityDataJson = {
					"processInstanceId":item.processInstanceId
				};
				var params = new FormData();
				params.append("entityDataJson",JSON.stringify(entityDataJson));
				$.ajax({
					url : "../rest/entity/instance/project/"+vs.data+"?tenantId="+$('#tenantId').val()+"&userId="+$('#loguser').val()+"",
					method: "PUT",
					data: params,
					async: false,
					cache: false,
					contentType: false,
					processData: false,
					success: function(da){debugger;
						if(da.success){
							var parDoc = window.parent.window;
							  if ( parDoc.openTab ) {
								parDoc.closeTab( "","我的待办", true );
							  } else {
								window.close();
							  }
						}
					}
				});
			}else{
				$.shade(false);
				$.epm.snackbar("流程启动失败");
				if( location.href.indexOf('_i') != -1 )
					$.custom.form.subflag = 0;
				else
					location.href += ('_i' + vs.data);
			}
		  }
		})
	}else{
	  var parDoc = window.parent.window;
	  if ( parDoc.openTab ) {
		parDoc.closeTab( "","我的待办", true );
	  } else {
		window.close();
	  }
	}
}
if($("[data-entity-fieldcode=processInstanceStatus]").not($("label")).val() == "2"){

}else{
	$("[data-entity-fieldcode=processInstanceStatus]").not($("label")).val("1");
}
if($('[data-bdt-com-onsubmit]').find("label.control-label").find("span").length > 0){
	var validate = false;
}else{
	var validate = true;
}
$('[data-bdt-com-onsubmit]').each(function(index,item) {
	var $div = $(this);
	!eval("(function(){return " + $div.data('bdt-com-onsubmit') + " })()")($div.children()) ? validate = false : null;
});

var xmCode = $.custom.getFieldValue("manageOrganizationId");
var xzCode = $.custom.getFieldValue("administrativeOrganizationId");
$.ajax({
	url : "/omsepm/epmProject/deptValidate",
	type : "POST",
	data : {
		"xmCode":xmCode,
		"xzCode":xzCode
	},
	success : function(data) {
    debugger
		if($.custom.getFieldValue("isScientific") == 'yes' && ($.custom.getFieldValue("projectDescription") !=""|| $.custom.getFieldValue("specialRequire") !="" || $.custom.getFieldValue("purchaseDescription") !="" || $.custom.getFieldValue("peopleCostDescription") !="")){
			$.shade(false);
			$.epm.snackbar("科研项目中不能填写项目描述、项目投入特殊要求/风险、采购说明、人员投入说明！");
			return;
		}else if($.custom.getFieldValue("manageOrganizationId")=="root" || $.custom.getFieldValue("manageOrganizationId") == "bonc01"){
			$.shade(false);
			$.epm.snackbar("项目组织不能选择项目管理体系、东方国信母公司，请重新选择！");
			return;
		}else if(!data.validateResult){
			$.shade(false);
			$.epm.snackbar("行政组织和项目组织不在同一个事业部，请重新选择！");
			return;
		}else if($.custom.getFieldValue("profitRate")<20){
			$.shade(false);
			$.epm.snackbar("利润率小于20%,是否继续提交？",10000000000,"确定","取消",
			function(){
				$.shade(true);
				validate ? ( submitFlag = false,$.custom.form.subflag = 1,$('form').submit() ) : $.epm.snackbar('数据填写有误，请检查后再提交！','2000',function(){$.shade(false)});
			},function(){
				return;
			})
		}else{
			validate ? ( submitFlag = false,$.custom.form.subflag = 1,$('form').submit() ) : $.epm.snackbar('数据填写有误，请检查后再提交！','2000',function(){$.shade(false)});
		}
	}
})
}
