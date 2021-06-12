import * as React from "react";
import * as yup from "yup";
import { Button, createStyles, makeStyles, Theme, Typography } from "@material-ui/core";
import { Send as SendIcon } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import clsx from "clsx";
import dayjs from "dayjs";

import { cancelGetCaptcha, Comment, getCaptcha, getComment, postComment } from "API";
import { randomString } from "utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    authCode: {
      marginTop: theme.spacing(2),
      display: "flex",
      justifyContent: "space-between",

      "& img": {
        width: 80,
        height: 30,
      },

      "& input": {
        width: 80,
      },

      "& button": {
        alignSelf: "flex-end",
      },
    },
    commentInput: {
      maxWidth: 600,
    },
    commentList: {
      display: "flex",
    },
    comment: {
      width: "100%",
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: "8px",
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
      boxSizing: "border-box",

      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1.5),
      },

      "& textarea": {
        width: "100%",
        outline: "none",
        resize: "none",
        minHeight: "146px",
        borderRadius: "8px",
        padding: theme.spacing(1),
        boxSizing: "border-box",
        border: `1px solid ${theme.palette.background.paper}`,
        backgroundColor: theme.palette.background.paper,
        color: "inherit",

        [theme.breakpoints.up("sm")]: {
          minHeight: "168px",
          fontSize: "18px",
        },

        "&:focus": {
          backgroundColor: theme.palette.background.default,
        },

        "&:hover": {
          backgroundColor: theme.palette.background.default,
        },
      },
    },
    commentFooter: {
      display: "flex",
      marginTop: theme.spacing(3),
      justifyContent: "space-between",

      "& .left": {
        display: "flex",
        alignItems: "center",
      },

      "& input": {
        outline: "none",
        border: `1px solid ${theme.palette.background.paper}`,
        padding: theme.spacing(0.5, 1),
        borderRadius: "2px",
        height: "30px",
        lineHeight: "30px",
        width: "80px",
        marginLeft: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        color: "inherit",

        "&:focus": {
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.background.default}`,
        },

        "&:hover": {
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.background.default}`,
        },
      },

      "& img": {
        width: 80,
        height: 30,
        borderRadius: "2px",
      },
    },
    inputError: {
      border: `1px solid ${theme.palette.error.main} !important`,
    },
  })
);

const validationSchema = yup.object({
  content: yup.string().required("请输入评论内容"),
  captcha: yup.string().min(4, "验证码至少4位").required("请输入验证码"),
});

interface CommentPropTypes {
  id: number;
}

export function CommentComponent(props: CommentPropTypes) {
  const { id } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [captchaLoading, setCaptchaLoading] = React.useState<boolean>(true);
  const [captcha, setCaptcha] = React.useState<string>("");
  const [captchaID, setCaptchaID] = React.useState<string>(randomString());

  const [postLoading, setPostLoading] = React.useState<boolean>(false);

  const [commentList, setCommentList] = React.useState<Array<Comment>>([]);

  const formik = useFormik({
    initialValues: {
      content: "",
      captcha: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setPostLoading(true);

      postComment({ resource_id: id, captcha: values.captcha, content: values.content, id: captchaID })
        .then((res) => {
          if (res) {
            enqueueSnackbar(res.data.message, { variant: "success" });
          }
        })
        .catch((error) => {
          if (error.isAxiosError) {
            enqueueSnackbar(`评论出错: ${error.response.data.message}`, { variant: "error" });
            return;
          }
          enqueueSnackbar(`评论出错: ${error.message}`, { variant: "error" });
        })
        .finally(() => {
          setPostLoading(false);
        });
    },
  });

  React.useEffect(() => {
    setCaptchaLoading(true);
    getCaptcha(captchaID)
      .then((res) => {
        if (res) {
          setCaptcha(res.data);
        }

        setCaptchaLoading(false);
      })
      .catch((error) => {
        enqueueSnackbar(`验证码获取错误: ${error.message}`, { variant: "error" });

        setCaptchaLoading(false);
      });

    getComment({ resource_id: id, page: 1, size: 10 })
      .then((res) => {
        if (res) {
          console.log(res);
          setCommentList(res.data.data);
        }

        setCaptchaLoading(false);
      })
      .catch((error) => {
        enqueueSnackbar(`获取评论列表出错: ${error.message}`, { variant: "error" });

        setCaptchaLoading(false);
      });

    return cancelGetCaptcha;
  }, [captchaID, enqueueSnackbar, id]);

  const refreshCaptcha = () => {
    if (captchaLoading) return;
    setCaptchaID(randomString());
  };

  return (
    <div>
      <Typography component="h2" variant="h5" style={{ marginBottom: "16px" }}>
        评论
      </Typography>
      <form className={classes.comment} onSubmit={formik.handleSubmit}>
        <textarea
          name="content"
          maxLength={400}
          placeholder="写点啥"
          autoComplete="off"
          value={formik.values.content}
          onChange={formik.handleChange}
          className={clsx({ [classes.inputError]: formik.touched.content && Boolean(formik.errors.content) })}
        />

        <div className={classes.commentFooter}>
          <div className="left">
            <img src={captcha} alt="验证码" onClick={refreshCaptcha} />
            <input
              placeholder="验证码"
              maxLength={4}
              name="captcha"
              autoComplete="off"
              value={formik.values.captcha}
              onChange={formik.handleChange}
              className={clsx({ [classes.inputError]: formik.errors.captcha })}
            />
          </div>
          <div className="left">
            <Typography variant="body2" color="textSecondary">
              {formik.values.content.length} 字
            </Typography>
            <Button
              variant="contained"
              size="small"
              disableElevation
              endIcon={<SendIcon />}
              style={{ marginLeft: "8px" }}
              type="submit"
            >
              提交
            </Button>
          </div>
        </div>
      </form>

      <div>
        <Typography component="h2" variant="h5" style={{ margin: "16px 0" }}>
          评论
        </Typography>

        {commentList.map((comment) => (
          <div className={classes.commentList}>
            <Typography>{comment.username}</Typography>
            <Typography>&nbsp;{comment.content}</Typography>
            <Typography>&nbsp;{dayjs(comment.date).format("YYYY-MM-DD HH:ss")}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
