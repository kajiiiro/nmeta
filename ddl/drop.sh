for i in `psql nmeta nmeta -c "\d" | grep nmeta | awk '{print $3}'`;do
  if [ "vms" = "$i" ];then
    psql nmeta nmeta -c "drop table $i"
  else
    psql nmeta nmeta -c "drop view $i"
  fi
done
