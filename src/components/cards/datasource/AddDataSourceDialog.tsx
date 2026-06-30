"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  addDataSource,
  listAvailableSqliteDbs,
} from "@/app/actions/dataSource";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDataSourceStore } from "@/store/useDataSourceStore";
import { AdminPasswordDialog } from "../../AdminPasswordDialog";

const formSchema = z.object({
  type: z.enum(["sqlite", "mysql", "postgresql"]),
  name: z.string().min(2, {
    message: "数据源名称至少包含 2 个字符",
  }),
  // SQLite fields
  file: z.string().optional(),
  // MySQL/PostgreSQL fields
  host: z.string().optional(),
  port: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
});

interface AddDataSourceDialogProps {
  children?: React.ReactNode;
}

export function AddDataSourceDialog({ children }: AddDataSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sqliteDbs, setSqliteDbs] = useState<{ name: string; file: string }[]>(
    [],
  );
  const [loadingDbs, setLoadingDbs] = useState(false);

  const setCurrentDataSource = useDataSourceStore(
    (state) => state.setCurrentDataSource,
  );
  const { isDialogOpen, setIsDialogOpen, withAdminAuth, handleVerified } =
    useAdminAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "sqlite",
      name: "",
      file: "",
      host: "localhost",
      port: "",
      user: "",
      password: "",
      database: "",
    },
  });

  const dbType = form.watch("type");

  const fetchDbs = useCallback(async () => {
    setLoadingDbs(true);
    try {
      const result = await listAvailableSqliteDbs();
      if (result.success && result.data) {
        setSqliteDbs(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch sqlite dbs:", error);
    } finally {
      setLoadingDbs(false);
    }
  }, []);

  useEffect(() => {
    if (open && dbType === "sqlite") {
      fetchDbs();
    }
  }, [open, dbType, fetchDbs]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    withAdminAuth(async () => {
      setLoading(true);
      try {
        let connectionInfo: Record<string, unknown> = {};
        if (values.type === "sqlite") {
          // values.file 现在是 "name/file.db" 格式
          const [name, file] = (values.file || "").split("/");
          connectionInfo = { file, name };
        } else {
          connectionInfo = {
            host: values.host,
            port: values.port ? parseInt(values.port, 10) : undefined,
            user: values.user,
            password: values.password,
            database: values.database,
          };
        }

        const result = await addDataSource({
          name: values.name,
          type: values.type,
          connectionInfo,
        });

        if (result.success && result.data) {
          setCurrentDataSource(result.data);
          setOpen(false);
          form.reset();
        } else {
          form.setError("root", {
            message: result.error || "添加失败",
          });
        }
      } catch (_error) {
        form.setError("root", {
          message: "发生未知错误，请重试",
        });
      } finally {
        setLoading(false);
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              添加数据源
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加数据源</DialogTitle>
            <DialogDescription>
              连接到一个数据库以开始 AI 数据分析。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>数据库类型</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === "mysql") form.setValue("port", "3306");
                        if (val === "postgresql") form.setValue("port", "5432");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择数据库类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>数据源名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：销售数据" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {dbType === "sqlite" ? (
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>选择数据库文件</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={fetchDbs}
                          disabled={loadingDbs}
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${loadingDbs ? "animate-spin" : ""}`}
                          />
                        </Button>
                      </div>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // 自动设置数据源名称为目录名
                          const selected = sqliteDbs.find(
                            (db) => `${db.name}/${db.file}` === val,
                          );
                          if (selected) {
                            form.setValue("name", selected.name);
                            // 我们在 connectionInfo 中只需要文件名，路径由后端根据 name 拼接
                            // 但为了保持 onSubmit 逻辑简单，我们这里存完整路径，或者在 onSubmit 处理
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择数据库文件" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sqliteDbs.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              未发现数据库文件
                              <p className="mt-1 text-xs">
                                请放置在 data/db/目录名/ 目录下
                              </p>
                            </div>
                          ) : (
                            sqliteDbs.map((db) => (
                              <SelectItem
                                key={`${db.name}/${db.file}`}
                                value={`${db.name}/${db.file}`}
                              >
                                {db.name} ({db.file})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>主机 (Host)</FormLabel>
                          <FormControl>
                            <Input placeholder="localhost" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>端口 (Port)</FormLabel>
                          <FormControl>
                            <Input placeholder="3306" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户名 (User)</FormLabel>
                        <FormControl>
                          <Input placeholder="root" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码 (Password)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="database"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>数据库名 (Database)</FormLabel>
                        <FormControl>
                          <Input placeholder="my_database" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  确认添加
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AdminPasswordDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onVerified={handleVerified}
      />
    </>
  );
}
