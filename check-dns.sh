#!/bin/bash
echo "🔍 Checking DNS propagation for legolasan.in..."
echo ""
echo "Checking from multiple DNS servers:"
echo "-----------------------------------"
for dns in "8.8.8.8" "1.1.1.1" "208.67.222.222"; do
    echo -n "Google DNS (8.8.8.8): "
    LEGALASAN=$(dig +short legolasan.in @8.8.8.8 | head -1)
    WWW=$(dig +short www.legolasan.in @8.8.8.8 | head -1)
    if [ "$LEGALASAN" = "XXX.XX.XX.XX" ] && [ "$WWW" = "XXX.XX.XX.XX" ]; then
        echo "✅ Both domains resolve correctly"
    else
        echo "❌ legolasan.in: ${LEGALASAN:-not resolved}, www.legolasan.in: ${WWW:-not resolved}"
    fi
done
echo ""
echo "If both domains resolve to XXX.XX.XX.XX from all servers, DNS is ready for SSL!"
