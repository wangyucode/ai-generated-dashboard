import { AlertCircle } from "lucide-react";

export function AIConfigAlert() {
    return (
        <div className="col-span-full flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 -order-2">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>未检测到 AI 配置。请点击右上角“设置”进行配置。</span>
            </div>
        </div>
    );
}
